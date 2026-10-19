import { useLayoutEffect, useRef } from "react";

/**
 * FLIP animation for a re-ordered list: each element glides from where it was to
 * where it is now. Pass the keys in their current order; the returned function
 * gives each row its ref callback.
 */
export function useFlip(keys: string[]) {
  const refs = useRef(new Map<string, HTMLElement>());
  const prev = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    refs.current.forEach((el, k) => {
      const top = el.getBoundingClientRect().top;
      const old = prev.current.get(k);
      if (!reduceMotion && old !== undefined && old !== top) {
        el.animate([{ transform: `translateY(${old - top}px)` }, { transform: "translateY(0)" }], {
          duration: 650,
          easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
        });
      }
      prev.current.set(k, top);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys.join("|")]);
  return (k: string) => (el: HTMLElement | null) => {
    if (el) refs.current.set(k, el);
    else refs.current.delete(k);
  };
}
