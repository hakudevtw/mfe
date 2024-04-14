import React from "react";
import { mount } from "auth/AuthApp";
import RenderChild from "./RenderChild";

export default function AuthApp({ onSignIn }) {
  return <RenderChild mount={mount} onSignIn={onSignIn} />;
}
