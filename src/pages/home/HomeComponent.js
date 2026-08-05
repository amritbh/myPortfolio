import React, { Component } from "react";
import Header from "../../components/header/Header";
import Greeting from "../../containers/greeting/Greeting";
import Skills from "../../containers/skills/Skills";
import FeaturedBlogs from "../../containers/featuredBlogs/FeaturedBlogs";
import TravelTeaser from "../../containers/travelTeaser/TravelTeaser";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";

class Home extends Component {
  render() {
    return (
      <div>
        <Header
          theme={this.props.theme}
          themeMode={this.props.themeMode}
          onThemeChange={this.props.onThemeChange}
        />
        <Greeting theme={this.props.theme} />
        <FeaturedBlogs theme={this.props.theme} />
        <Skills theme={this.props.theme} />
        <TravelTeaser theme={this.props.theme} />
        <Footer theme={this.props.theme} />
        <TopButton theme={this.props.theme} />
      </div>
    );
  }
}

export default Home;
