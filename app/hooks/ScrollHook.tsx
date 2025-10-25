import { useEffect } from "react";
import { usePathname } from "next/navigation";

const useScrollToHash = () => {
  const path = usePathname();

  useEffect(() => {
    const { hash } = window.location;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [path]);
};

export default useScrollToHash;
