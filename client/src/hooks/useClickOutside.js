import { useEffect } from "react";

function useClickOutside(ref, onClickOutside, enabled = true) {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClickOutside();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [enabled, onClickOutside, ref]);
}

export default useClickOutside;
