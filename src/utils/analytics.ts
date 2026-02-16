declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    plausible?: (...args: any[]) => void;
  }
}

interface AnalyticsConfig {
  provider: 'google' | 'plausible' | 'none';
  trackingId?: string;
}

const config: AnalyticsConfig = {
  provider: import.meta.env.VITE_ANALYTICS_PROVIDER || 'none',
  trackingId: import.meta.env.VITE_ANALYTICS_ID || '',
};

export const initAnalytics = () => {
  if (config.provider === 'google' && config.trackingId) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.trackingId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', config.trackingId);
  } else if (config.provider === 'plausible') {
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = window.location.hostname;
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
  }
};

export const trackPageView = (url: string) => {
  if (config.provider === 'google' && window.gtag) {
    window.gtag('config', config.trackingId, {
      page_path: url,
    });
  } else if (config.provider === 'plausible' && window.plausible) {
    window.plausible('pageview');
  }
};

export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  if (config.provider === 'google' && window.gtag) {
    window.gtag('event', eventName, properties);
  } else if (config.provider === 'plausible' && window.plausible) {
    window.plausible(eventName, { props: properties });
  }
};

export const trackConversion = (conversionName: string, value?: number) => {
  trackEvent('conversion', {
    conversion_name: conversionName,
    value: value,
  });
};
