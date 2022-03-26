import { useState, useRef, useCallback, useEffect } from "react";

// Infinite Scroll Code (custom hook)
export const useScrolledToBottom = (options, loaded) => {

  const observer = useRef();
  const [needMoreItems, setNeedMoreItems] = useState(false);

  const handleObserver = (entries) => {
    const [ entry ] = entries;
    setNeedMoreItems(entry.isIntersecting);

  }

  const endOfScrollRef = useCallback(domNode => {

    if (!loaded) return
    if (observer.current) {
      // each time callback executes, disconnect observer from current endOfScrollRef 
      // and attach it to the new one
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(handleObserver, options);

    if (domNode) {
      // if last element exists, tell observer to observe it.
      observer.current.observe(domNode);
    }
  });

  return [endOfScrollRef, needMoreItems];
}