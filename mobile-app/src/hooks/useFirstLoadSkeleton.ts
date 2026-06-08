import { useEffect, useRef, useState } from "react";

export function useFirstLoadSkeleton(isLoading: boolean): boolean {
  const hasLoadedOnce = useRef(false);
  const [showSkeleton, setShowSkeleton] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      if (!hasLoadedOnce.current) {
        setShowSkeleton(true);
      }
      return;
    }

    hasLoadedOnce.current = true;
    setShowSkeleton(false);
  }, [isLoading]);

  return showSkeleton;
}
