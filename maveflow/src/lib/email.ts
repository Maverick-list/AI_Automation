import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email notification.
 */
export async function sendNotificationEmail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: `"MaveFlow System" <${process.env.SMTP_FROM || "alerts@maveflow.app"}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Notification sent to ${to}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    return false;
  }
}

/**
 * Pre-defined HTML Templates
 */
export const EmailTemplates = {
  runFailed: (automationName: string, errorMsg: string, runId: string) => `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h2 style="color: #e53e3e;">Automation Failed</h2>
      <p>Your workflow <strong>"${automationName}"</strong> encountered an error during execution.</p>
      <div style="background-color: #fff5f5; padding: 15px; border-left: 4px solid #e53e3e; margin: 20px 0;">
        <code style="color: #c53030;">${errorMsg}</code>
      </div>
      <p>Run ID: ${runId}</p>
      <a href="${process.env.NEXTAUTH_URL}/dashboard/history?run=${runId}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">View Logs in Dashboard</a>
    </div>
  `,

  tokenExpired: (serviceName: string) => `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h2 style="color: #d69e2e;">Action Required: Reconnect ${serviceName}</h2>
      <p>The authentication token for <strong>${serviceName}</strong> has been revoked or expired.</p>
      <p>Automations depending on this service will fail until you reconnect your account.</p>
      <br/>
      <a href="${process.env.NEXTAUTH_URL}/dashboard/integrations" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Reconnect Now</a>
    </div>
  `,
};
