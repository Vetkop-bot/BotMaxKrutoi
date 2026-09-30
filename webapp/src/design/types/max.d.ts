// MAX Bridge (https://dev.max.ru/docs/webapps/bridge), loaded in index.html as window.WebApp
export {};

export interface MaxUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

type ImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";

export interface MaxWebApp {
  /** Signed launch data, validated by the backend */
  initData: string | null;
  initDataUnsafe: {
    user?: MaxUser;
    start_param?: string;
  };
  platform: "ios" | "android" | "desktop" | "web" | null;
  ready(): void;
  close(): void;
  HapticFeedback: {
    impactOccurred(style: ImpactStyle): Promise<unknown>;
    notificationOccurred(type: "error" | "success" | "warning"): Promise<unknown>;
  };
  shareMaxContent(content: { text?: string; link?: string }): Promise<unknown>;
}

declare global {
  interface Window {
    WebApp?: MaxWebApp;
  }
}
