import React from "react";
import { mount } from "marketing/MarketingApp";
import RenderChild from "./RenderChild";

// 雖然這邊使用 React，但 mount function 不需要是 React
export default function MarketingApp() {
  return <RenderChild mount={mount} />;
}
