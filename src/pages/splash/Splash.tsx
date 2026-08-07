import React, { useState, useEffect } from "react";
import "./Splash.css";
import { Redirect } from "react-router-dom";
import LoaderLogo from "../../components/Loader/LoaderLogo";
import { Theme } from "../../types";

interface SplashProps {
  theme: Theme;
}

const AnimatedSplash: React.FC<SplashProps> = ({ theme }) => {
  return (
    <div className="logo_wrapper">
      <div className="screen" style={{ backgroundColor: theme.splashBg }}>
        <LoaderLogo id="logo" theme={theme} />
      </div>
    </div>
  );
};

const Splash: React.FC<SplashProps> = ({ theme }) => {
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setRedirect(true), 5500);
    return () => clearTimeout(id);
  }, []);

  return redirect ? <Redirect to="/home" /> : <AnimatedSplash theme={theme} />;
};

export default Splash;
