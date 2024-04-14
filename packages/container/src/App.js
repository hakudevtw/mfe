import React, { lazy, Suspense, useState, useEffect } from "react";
import { Router, Redirect, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";
import { StylesProvider, createGenerateClassName } from "@material-ui/core";
import Header from "./components/Header";
import Progress from "./components/Progress";

const MarketingLazy = lazy(() => import("./components/MarketingApp"));
const AuthLazy = lazy(() => import("./components/AuthApp"));
const DashboardLazy = lazy(() => import("./components/DashboardApp"));

const generateClassName = createGenerateClassName({
  productionPrefix: "co",
});

// Getting the history in App component
const history = createBrowserHistory();

export default () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    if (isSignedIn) history.push("/dashboard");
  }, [isSignedIn]);

  return (
    <Router history={history}>
      <StylesProvider generateClassName={generateClassName}>
        <div>
          <Header isSignedIn={isSignedIn} onSignOut={() => setIsSignedIn(false)} />
          <Suspense fallback={<Progress />}>
            <Switch>
              <Route path="/dashboard">
                {!isSignedIn ? <Redirect to="/" /> : <DashboardLazy />}
              </Route>
              <Route path="/auth">
                <AuthLazy onSignIn={() => setIsSignedIn(true)} />
              </Route>
              <Route path="/">
                <MarketingLazy />
              </Route>
            </Switch>
          </Suspense>
        </div>
      </StylesProvider>
    </Router>
  );
};
