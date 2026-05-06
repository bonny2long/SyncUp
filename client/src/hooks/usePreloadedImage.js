import { useEffect, useState } from "react";

export default function usePreloadedImage(src, { desktopOnly = false } = {}) {
  const [ready, setReady] = useState(() => {
    if (!src || typeof window === "undefined") return true;
    return desktopOnly && !window.matchMedia("(min-width: 1024px)").matches;
  });

  useEffect(() => {
    const skipPreload =
      !src ||
      typeof window === "undefined" ||
      (desktopOnly && !window.matchMedia("(min-width: 1024px)").matches);

    if (skipPreload) {
      setReady(true);
      return undefined;
    }

    setReady(false);
    const image = new Image();
    image.decoding = "async";
    image.onload = () => setReady(true);
    image.onerror = () => setReady(true);
    image.src = src;

    if (image.complete) {
      setReady(true);
    }

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [desktopOnly, src]);

  return ready;
}
