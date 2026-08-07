import React from "react";
import Header from "../../components/header/Header";
import Greeting from "../../containers/greeting/Greeting";
import Skills from "../../containers/skills/Skills";
import FeaturedBlogs from "../../containers/featuredBlogs/FeaturedBlogs";
import TravelTeaser from "../../containers/travelTeaser/TravelTeaser";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";
import type { Theme, ThemeMode } from "../../types";

interface HomeProps {
  theme: Theme;
  themeMode?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
}

const Home: React.FC<HomeProps> = ({ theme, themeMode, onThemeChange }) => {
  return (
    <div>
      <Header
        theme={theme}
        themeMode={themeMode}
        onThemeChange={onThemeChange}
      />
      <Greeting theme={theme} />
      <FeaturedBlogs theme={theme} />
      <Skills theme={theme} />
      <TravelTeaser theme={theme} />
      <Footer theme={theme} />
      <TopButton theme={theme} />
    </div>
  );
};

export default Home;
