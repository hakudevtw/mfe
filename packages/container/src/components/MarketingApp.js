import React, { useRef, useEffect } from "react";
import { mount } from "marketing/MarketingApp";

// 雖然這邊使用 React，但 mount function 不需要是 React
export default function MarketingApp() {
  const ref = useRef(null);

  useEffect(() => {
    mount(ref.current);
  }, []);

  return <div ref={ref} />;
}
