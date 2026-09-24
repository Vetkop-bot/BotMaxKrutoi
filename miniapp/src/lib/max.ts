// Thin typed wrapper around MAX Bridge (https://dev.max.ru/docs/webapps/bridge).
// The bridge script is loaded in index.html and exposes window.WebApp.
// Outside the MAX client (plain browser) every helper degrades to a no-op.

export interface MaxUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

type ImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
type NotificationType = "error" | "success" | "warning";

interface MaxWebApp {
  initData: string;
  initDataUnsafe: {
    user?: MaxUser;
    start_param?: string;
  };
  platform: "ios" | "android" | "desktop" | "web";
  ready(): void;
  close(): void;
  BackButton: {
    isVisible: boolean;
    show(): void;
    hide(): void;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
  };
  HapticFeedback: {
    impactOccurred(style: ImpactStyle): Promise<unknown>;
    notificationOccurred(type: NotificationType): Promise<unknown>;
    selectionChanged(): Promise<unknown>;
  };
  DeviceStorage: {
    setItem(key: string, value: string): Promise<unknown>;
    getItem(key: string): Promise<unknown>;
  };
  shareMaxContent(content: { text?: string; link?: string }): Promise<unknown>;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
}

declare global {
  interface Window {
    WebApp?: MaxWebApp;
  }
}

const webApp = window.WebApp;

/** True only when running inside the MAX client (initData is signed by MAX). */
export const isInMax = Boolean(webApp?.initData);

/** Bridge requests reject on timeout/errors — never let that surface as an unhandled rejection. */
function quiet(result: unknown) {
  if (result && typeof (result as Promise<unknown>).catch === "function") {
    (result as Promise<unknown>).catch(() => {});
  }
}

export const max = {
  user: (isInMax ? webApp?.initDataUnsafe.user : undefined) ?? null,
  startParam: (isInMax ? webApp?.initDataUnsafe.start_param : undefined) ?? null,

  ready() {
    if (isInMax) webApp!.ready();
  },

  backButton(visible: boolean) {
    if (!isInMax) return;
    if (visible) webApp!.BackButton.show();
    else webApp!.BackButton.hide();
  },

  onBack(cb: () => void) {
    if (!isInMax) return () => {};
    webApp!.BackButton.onClick(cb);
    return () => webApp!.BackButton.offClick(cb);
  },

  closingConfirmation(enabled: boolean) {
    if (!isInMax) return;
    if (enabled) webApp!.enableClosingConfirmation();
    else webApp!.disableClosingConfirmation();
  },

  haptic: {
    tap(style: ImpactStyle = "light") {
      if (isInMax) quiet(webApp!.HapticFeedback.impactOccurred(style));
    },
    select() {
      if (isInMax) quiet(webApp!.HapticFeedback.selectionChanged());
    },
    notify(type: NotificationType) {
      if (isInMax) quiet(webApp!.HapticFeedback.notificationOccurred(type));
    },
  },

  /** Share into a MAX chat; falls back to the Web Share API / clipboard in a browser. */
  async share(text: string) {
    if (isInMax) {
      quiet(webApp!.shareMaxContent({ text }));
      return;
    }
    if (navigator.share) {
      await navigator.share({ text }).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(text).catch(() => {});
    }
  },

  storage: {
    async get(key: string): Promise<string | null> {
      if (!isInMax) return null;
      try {
        const res = await webApp!.DeviceStorage.getItem(key);
        if (typeof res === "string") return res;
        const value = (res as { value?: unknown } | null)?.value;
        return typeof value === "string" ? value : null;
      } catch {
        return null;
      }
    },
    set(key: string, value: string) {
      if (isInMax) quiet(webApp!.DeviceStorage.setItem(key, value));
    },
  },
};
