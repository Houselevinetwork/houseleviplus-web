// Analytics Event Tracker

export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
  timestamp?: Date;
  userId?: string;
}

export class AnalyticsTracker {
  track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      eventName,
      properties,
      timestamp: new Date(),
    };
    
    // TODO: Send to analytics service (Google Analytics, Mixpanel, etc.)
    console.log('Analytics Event:', event);
  }

  trackVideoPlay(contentId: string, contentTitle: string) {
    this.track('video_play', { contentId, contentTitle });
  }

  trackVideoComplete(contentId: string, duration: number) {
    this.track('video_complete', { contentId, duration });
  }

  trackSubscribe(planId: string, amount: number) {
    this.track('subscribe', { planId, amount });
  }
}

export const analytics = new AnalyticsTracker();
