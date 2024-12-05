import { useEffect } from "react";

const useEscKey = (callback) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        callback();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [callback]);
};

export default useEscKey;
