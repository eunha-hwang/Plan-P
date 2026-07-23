import mixpanel from "mixpanel-browser";

const TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

let initialized = false;

export function initMixpanel() {
  if (initialized || !TOKEN || typeof window === "undefined") return;
  mixpanel.init(TOKEN, {
    track_pageview: false,
    persistence: "localStorage",
  });
  initialized = true;
}

export function trackEvent(name: string, props?: Record<string, unknown>) {
  if (!initialized) return;
  mixpanel.track(name, props);
}

export function trackPageview(path: string) {
  trackEvent("Page View", { path });
}
