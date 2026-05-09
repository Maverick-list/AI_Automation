// ============================================
// MaveFlow - Google Calendar Service
// ============================================

import { google, calendar_v3 } from "googleapis";
import { getGoogleAuth } from "@/lib/google-client";
import { withGoogleRetry } from "@/lib/google-error";
import { randomUUID } from "crypto";

export class CalendarService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  private async getClient(): Promise<calendar_v3.Calendar> {
    const auth = await getGoogleAuth(this.userId);
    return google.calendar({ version: "v3", auth });
  }

  /**
   * Lists events from a specific calendar.
   */
  async listEvents(calendarId: string = "primary", timeMin?: string, timeMax?: string, maxResults: number = 20) {
    return withGoogleRetry(async () => {
      const calendar = await this.getClient();
      const res = await calendar.events.list({
        calendarId,
        timeMin: timeMin || new Date().toISOString(),
        timeMax,
        maxResults,
        singleEvents: true,
        orderBy: "startTime",
      });
      return res.data;
    });
  }

  /**
   * Lists all calendars for the authenticated user.
   */
  async listCalendars() {
    return withGoogleRetry(async () => {
      const calendar = await this.getClient();
      const res = await calendar.calendarList.list();
      return res.data;
    });
  }

  /**
   * Creates a new event.
   */
  async createEvent(payload: {
    summary: string;
    description?: string;
    location?: string;
    start: { dateTime: string; timeZone?: string };
    end: { dateTime: string; timeZone?: string };
    attendees?: string[];
  }, calendarId: string = "primary") {
    return withGoogleRetry(async () => {
      const calendar = await this.getClient();
      const res = await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: payload.summary,
          description: payload.description,
          location: payload.location,
          start: payload.start,
          end: payload.end,
          attendees: payload.attendees?.map((email) => ({ email })),
        },
      });
      return res.data;
    });
  }

  /**
   * Creates a new event with an attached Google Meet link.
   */
  async createMeet(payload: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone?: string };
    end: { dateTime: string; timeZone?: string };
    attendees?: string[];
  }, calendarId: string = "primary") {
    return withGoogleRetry(async () => {
      const calendar = await this.getClient();
      const res = await calendar.events.insert({
        calendarId,
        conferenceDataVersion: 1,
        requestBody: {
          summary: payload.summary,
          description: payload.description,
          start: payload.start,
          end: payload.end,
          attendees: payload.attendees?.map((email) => ({ email })),
          conferenceData: {
            createRequest: {
              requestId: randomUUID(), // Must be unique for each request
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        },
      });
      return res.data;
    });
  }

  /**
   * Updates an existing event.
   */
  async updateEvent(eventId: string, payload: Partial<calendar_v3.Schema$Event>, calendarId: string = "primary") {
    return withGoogleRetry(async () => {
      const calendar = await this.getClient();
      const res = await calendar.events.patch({
        calendarId,
        eventId,
        requestBody: payload,
      });
      return res.data;
    });
  }

  /**
   * Deletes an event.
   */
  async deleteEvent(eventId: string, calendarId: string = "primary") {
    return withGoogleRetry(async () => {
      const calendar = await this.getClient();
      await calendar.events.delete({
        calendarId,
        eventId,
      });
      return true;
    });
  }
}
