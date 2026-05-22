import { Injectable } from '@angular/core';

/**
 * Lightweight analytics service for Premium-related events.
 * Phase 0: logs to console only.
 * Future: replace console.log with a real analytics provider call.
 */
@Injectable({ providedIn: 'root' })
export class PremiumAnalyticsService {
  /**
   * Track a premium-related event.
   * @param eventName  A descriptive name, e.g. 'early_access_submitted'
   * @param metadata   Optional key/value pairs for additional context
   */
  trackPremiumEvent(eventName: string, metadata?: Record<string, unknown>): void {
    const payload = { event: eventName, timestamp: new Date().toISOString(), ...metadata };
    // TODO: replace with real analytics (e.g. Plausible, Amplitude, PostHog)
    console.log('[PremiumAnalytics]', payload);
  }
}
