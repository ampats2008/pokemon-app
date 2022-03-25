import { useState, useRef, useEffect } from "react";

// Infinite Scroll Code (custom hook)
export const useScrolledToBottom = (options) => {

    const endOfScrollRef = useRef(null);
    const [needMoreItems, setNeedMoreItems] = useState(false);

    const handleObserver = (entries) => {
      const [ entry ] = entries;
      setNeedMoreItems(entry.isIntersecting);
    }

    useEffect(() => {
      const observer = new IntersectionObserver(handleObserver, options);

      if (endOfScrollRef.current) { observer.observe(endOfScrollRef.current); }

      return () => {
        if (endOfScrollRef.current) { observer.unobserve(endOfScrollRef.current); }
      };
    }, [endOfScrollRef, options]);

    return [endOfScrollRef, needMoreItems];
  }