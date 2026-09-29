import type { MaxUser } from "../types/max";

const webApp = window.WebApp;

/** True only inside the MAX client: outside it the bridge exists but initData is empty. */
export const isInMax = Boolean(webApp?.initData);

// Bridge requests reject on timeout — don't let that become an unhandled rejection
function quiet(result: unknown) {
  if (result instanceof Promise) result.catch(() => {});
}

export const maxApp = {
  initData: (isInMax && webApp?.initData) || "",
  user: (isInMax ? webApp?.initDataUnsafe.user : undefined) ?? (null as MaxUser | null),
  startParam: (isInMax ? webApp?.initDataUnsafe.start_param : undefined) ?? null,

  ready() {
    if (isInMax) webApp!.ready();
  },

  haptic(type: "success" | "error" | "tap") {
    if (!isInMax) return;
    if (type === "tap") quiet(webApp!.HapticFeedback.impactOccurred("light"));
    else quiet(webApp!.HapticFeedback.notificationOccurred(type));
  },

  share(text: string) {
    if (isInMax) quiet(webApp!.shareMaxContent({ text }));
    else if (navigator.share) navigator.share({ text }).catch(() => {});
  },
};
