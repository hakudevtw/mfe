import React, { useEffect, useRef } from "react";
import { mount } from "marketing/MarketingApp";
import { useHistory } from "react-router-dom";

// 雖然這邊使用 React，但 mount function 不需要是 React
export default function MarketingApp() {
  const ref = useRef(null);
  const history = useHistory();

  useEffect(() => {
    const { onParentNavigate } = mount(ref.current, {
      initialPath: history.location.pathname,
      onNavigate: ({ pathname: nextPathname }) => {
        const { pathname } = history.location;
        if (pathname !== nextPathname) {
          history.push(nextPathname);
        }
      },
    });

    history.listen(onParentNavigate);
  }, []);

  return <div ref={ref} />;
}
