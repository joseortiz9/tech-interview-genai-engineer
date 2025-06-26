import { useEffect, useState } from "react";

const dots = ["", ".", "..", "..."];

export const useLoadingDots = (isLoading = false) => {
  const [loadingDots, setLoadingDots] = useState("");

  useEffect(() => {
    if (!isLoading) return;

    let i = 0;
    const interval = setInterval(() => {
      setLoadingDots(dots[i % dots.length]);
      i++;
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);


  return loadingDots;
};
