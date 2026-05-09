// ============================================
// MaveFlow - Automation Engine
// ============================================

import { db } from "./db";
import { GmailService } from "@/services/google/gmail";
import { DriveService } from "@/services/google/drive";
import { CalendarService } from "@/services/google/calendar";
import { TasksService } from "@/services/google/tasks";
import { SheetsService } from "@/services/google/sheets";
import { OpenClawService } from "./openclaw-service";
import { webhookQueue } from "./queue";

// ── Types ───────────────────────────────────────────────────────

type ActionState = Record<string, any>;

interface ActionConfig {
  type: string;
  config: Record<string, any>;
  order: number;
}

// ── Interpolation Helper ────────────────────────────────────────

/**
 * Replaces {{variable.name}} with actual values from the state context.
 */
function interpolate(template: string, state: ActionState): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const keys = path.trim().split(".");
    let current: any = state;
    for (const key of keys) {
      if (current === undefined || current === null) return match;
      current = current[key];
    }
    return current !== undefined ? String(current) : match;
  });
}

function interpolateObject(obj: Record<string, any>, state: ActionState): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = interpolate(value, state);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => 
        typeof item === "string" ? interpolate(item, state) : 
        (typeof item === "object" && item !== null ? interpolateObject(item, state) : item)
      );
    } else if (typeof value === "object" && value !== null) {
      result[key] = interpolateObject(value, state);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ── Execution Engine ────────────────────────────────────────────

export class AutomationEngine {
  
  /**
   * Evaluates conditional logic.
   */
  private evaluateCondition(condition: any, state: ActionState): boolean {
    const { field, operator, value } = condition;
    
    // Resolve field value from state if it looks like a variable
    let actualField = field;
    if (typeof field === "string" && field.includes("{{")) {
      actualField = interpolate(field, state);
    }

    let actualValue = value;
    if (typeof value === "string" && value.includes("{{")) {
      actualValue = interpolate(value, state);
    }

    switch (operator) {
      case "==": return actualField == actualValue;
      case "===": return actualField === actualValue;
      case "!=": return actualField != actualValue;
      case ">": return Number(actualField) > Number(actualValue);
      case "<": return Number(actualField) < Number(actualValue);
      case "contains": return String(actualField).includes(String(actualValue));
      default: return false;
    }
  }

  /**
   * Executes a single action step with timeout and retries.
   */
  private async executeAction(
    userId: string, 
    action: ActionConfig, 
    state: ActionState
  ): Promise<any> {
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        // Interpolate config with current state
        const config = interpolateObject(action.config, state);

        // Execute Action with Timeout (30s)
        const promise = this.routeAction(userId, action.type, config, state);
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Action timeout (30s): ${action.type}`)), 30000)
        );

        return await Promise.race([promise, timeout]);

      } catch (error: any) {
        attempt++;
        if (attempt >= maxRetries) {
          throw new Error(`Action '${action.type}' failed after ${maxRetries} attempts: ${error.message}`);
        }
        // Exponential backoff: 2s, 4s, 8s
        const backoff = 1000 * Math.pow(2, attempt);
        console.warn(`[Engine] Action failed, retrying in ${backoff}ms...`, error.message);
        await new Promise(res => setTimeout(res, backoff));
      }
    }
  }

  /**
   * Routes the action to the correct Service implementation.
   */
  private async routeAction(
    userId: string, 
    type: string, 
    config: Record<string, any>,
    state: ActionState
  ): Promise<any> {
    switch (type) {
      case "send_email": {
        const gmail = new GmailService(userId);
        const to = Array.isArray(config.to) ? config.to : [config.to];
        return await gmail.sendEmail(to, config.subject, config.body, config.isHtml);
      }
      
      case "save_to_drive": {
        const drive = new DriveService(userId);
        const buffer = Buffer.from(config.content || "", "utf-8");
        return await drive.uploadFile(buffer, config.mimeType || "text/plain", config.fileName, config.parentId);
      }

      case "create_calendar_event": {
        const calendar = new CalendarService(userId);
        return await calendar.createEvent({
          summary: config.summary,
          description: config.description,
          start: { dateTime: config.start },
          end: { dateTime: config.end },
          attendees: config.attendees
        });
      }

      case "add_task": {
        const tasks = new TasksService(userId);
        return await tasks.createTask(config.title, config.notes, config.due);
      }

      case "update_sheet": {
        const sheets = new SheetsService(userId);
        if (config.mode === "append") {
          return await sheets.appendRows(config.spreadsheetId, config.range, config.values);
        } else {
          return await sheets.writeRange(config.spreadsheetId, config.range, config.values);
        }
      }

      case "ask_openclaw": {
        const aiService = new OpenClawService();
        // Since we are running in backend, we execute an immediate query instead of streaming.
        // We'll wrap this in a session
        const sessionId = await aiService.startSession(userId, state);
        const result = await aiService.executeTask(sessionId, {
          name: "direct_query",
          payload: { prompt: config.prompt }
        });
        await aiService.closeSession(sessionId);
        return result;
      }

      case "send_webhook": {
        // Enqueue to Webhook queue to avoid blocking
        await webhookQueue.add("send_webhook", {
          url: config.url,
          payload: config.payload
        });
        return { status: "queued", url: config.url };
      }

      case "conditional": {
        return { matched: this.evaluateCondition(config.condition, state) };
      }

      case "delay": {
        const ms = (config.minutes || 0) * 60000 + (config.seconds || 0) * 1000;
        await new Promise(res => setTimeout(res, ms));
        return { delayedMs: ms };
      }

      default:
        throw new Error(`Unsupported action type: ${type}`);
    }
  }

  /**
   * Master execution function. Runs an entire workflow.
   */
  async executeWorkflow(automationId: string, initialContext: Record<string, any> = {}) {
    const automation = await db.automation.findUnique({
      where: { id: automationId },
      include: { workspace: true }
    });

    if (!automation) throw new Error("Automation not found");
    if (!automation.isActive) {
      console.log(`[Engine] Automation ${automationId} is inactive. Skipping.`);
      return;
    }

    // Prepare Run Record
    const run = await db.automationRun.create({
      data: {
        automationId,
        status: "RUNNING",
        startedAt: new Date(),
        logs: [],
      }
    });

    const state: ActionState = {
      trigger: initialContext,
      workspace: automation.workspace,
      env: process.env,
      steps: {} // Results of each step
    };

    const logs: any[] = [{ time: new Date().toISOString(), level: "info", message: "Workflow started" }];
    let hasFailed = false;

    // Parse Actions
    const actions = (automation.actions as ActionConfig[]).sort((a, b) => a.order - b.order);

    try {
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        
        // Check conditional early exit
        if (action.type === "conditional" && action.config.stopIfFalse) {
          const result = await this.executeAction(automation.workspace.ownerId, action, state);
          state.steps[`step_${i}`] = result;
          
          if (!result.matched) {
            logs.push({ time: new Date().toISOString(), level: "info", message: `Conditional stop evaluated to false. Exiting workflow.` });
            break; // Stop execution smoothly
          }
        } else {
          // Standard execution
          logs.push({ time: new Date().toISOString(), level: "info", message: `Executing action: ${action.type}` });
          
          const result = await this.executeAction(automation.workspace.ownerId, action, state);
          state.steps[`step_${i}`] = result;
          
          logs.push({ time: new Date().toISOString(), level: "success", message: `Action ${action.type} completed.` });
        }
      }

      // Mark success
      await db.automationRun.update({
        where: { id: run.id },
        data: {
          status: "SUCCESS",
          finishedAt: new Date(),
          logs: logs as any,
        }
      });

      // Update run count
      await db.automation.update({
        where: { id: automationId },
        data: { runCount: { increment: 1 }, lastRunAt: new Date() }
      });

    } catch (error: any) {
      logs.push({ time: new Date().toISOString(), level: "error", message: error.message });
      
      // Mark failure
      await db.automationRun.update({
        where: { id: run.id },
        data: {
          status: "FAILED",
          finishedAt: new Date(),
          logs: logs as any,
          errorMessage: error.message,
        }
      });
      console.error(`[Engine] Workflow Failed:`, error);
    }
  }
}
