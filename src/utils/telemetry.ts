// Silent Telemetry & Webhook Integration
import { UserProfile } from '../types';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Environment variables
const GA_MEASUREMENT_ID = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID || '';
const WEBHOOK_URL = (import.meta as any).env?.VITE_WEBHOOK_URL || '';

/**
 * Initialize Google Analytics 4 (GA4) dynamically in the background if a Measurement ID is configured
 */
export function initTelemetry() {
  try {
    if (GA_MEASUREMENT_ID && typeof document !== 'undefined') {
      // Check if script is already added
      if (!document.getElementById('ga-gtag-script')) {
        const script = document.createElement('script');
        script.id = 'ga-gtag-script';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
          window.dataLayer?.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', GA_MEASUREMENT_ID, {
          send_page_view: true,
          cookie_flags: 'SameSite=None;Secure',
        });
      }
    }
  } catch (err) {
    // Fail silently in production
    console.debug('Telemetry initialization notice:', err);
  }
}

/**
 * Track page views silently in GA4
 */
export function trackPageView(pageName: string) {
  try {
    if (window.gtag && GA_MEASUREMENT_ID) {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        page_path: `/${pageName}`,
      });
    }
  } catch (err) {
    // Fail silently
  }
}

/**
 * Track custom user events silently in GA4
 */
export function trackGAEvent(eventName: string, params: Record<string, any> = {}) {
  try {
    if (window.gtag && GA_MEASUREMENT_ID) {
      window.gtag('event', eventName, params);
    }
  } catch (err) {
    // Fail silently
  }
}

/**
 * Send user profile setup data directly to Google Sheets Webhook / External Database Endpoint
 * Data sent: Name, Mobile Number, User ID, Date/Timestamp
 */
export async function sendProfileToWebhook(profile: UserProfile, isFirstSync: boolean = false) {
  // Always track in GA4 first
  trackGAEvent(isFirstSync ? 'profile_initial_sync' : 'profile_updated', {
    user_id: profile.userId,
    user_name: profile.name,
    user_occupation: profile.occupation,
  });

  const targetUrl = WEBHOOK_URL || (import.meta as any).env?.VITE_WEBHOOK_URL;
  if (!targetUrl) {
    // If no webhook URL is defined yet in .env, store a silent debug log
    console.debug('[Telemetry] Profile ready for Webhook export:', {
      userId: profile.userId,
      name: profile.name,
      mobile: profile.mobile,
      occupation: profile.occupation,
      date: new Date().toLocaleDateString('en-IN'),
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const payload = {
    event: 'USER_PROFILE_SETUP',
    userId: profile.userId || 'NOT_ASSIGNED',
    name: profile.name || 'Anonymous',
    mobileNumber: profile.mobile || 'Not Provided',
    occupation: profile.occupation || 'Working Professional',
    date: new Date().toLocaleDateString('en-IN'),
    isoTimestamp: new Date().toISOString(),
    deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Device',
    appVersion: '1.0.0',
  };

  try {
    // Using mode: 'no-cors' allows Google Apps Script Webhooks (302 redirect) to work without CORS errors
    await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.debug('Silent webhook dispatch notice:', err);
  }
}
