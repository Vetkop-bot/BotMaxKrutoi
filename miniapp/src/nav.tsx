import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Screen } from "@/types";
import { max } from "@/lib/max";

interface Nav {
  screen: Screen;
  canGoBack: boolean;
  push(screen: Screen): void;
  /** Replace the current screen (e.g. form → created meeting) */
  replace(screen: Screen): void;
  back(): void;
}

const NavContext = createContext<Nav | null>(null);

/** Deep link: the bot can open the app with start_param "meeting_<id>". */
function initialStack(): Screen[] {
  const param = max.startParam;
  if (param?.startsWith("meeting_")) {
    return [{ name: "home" }, { name: "meeting", id: param.slice("meeting_".length) }];
  }
  return [{ name: "home" }];
}

export function NavProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Screen[]>(initialStack);

  const push = useCallback((screen: Screen) => {
    max.haptic.tap();
    setStack((s) => [...s, screen]);
  }, []);

  const replace = useCallback((screen: Screen) => {
    setStack((s) => [...s.slice(0, -1), screen]);
  }, []);

  const back = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  const canGoBack = stack.length > 1;

  // Native MAX back button mirrors the in-app stack
  useEffect(() => {
    max.backButton(canGoBack);
  }, [canGoBack]);

  useEffect(() => max.onBack(back), [back]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [stack.length]);

  const value = useMemo(
    () => ({ screen: stack[stack.length - 1], canGoBack, push, replace, back }),
    [stack, canGoBack, push, replace, back],
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): Nav {
  const nav = useContext(NavContext);
  if (!nav) throw new Error("useNav must be used inside <NavProvider>");
  return nav;
}
