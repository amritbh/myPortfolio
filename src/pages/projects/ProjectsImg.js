import React, { Component } from "react";
import projectsImage from "../../assests/images/projects_header.png";

export default class ProjectsImg extends Component {
  render() {
    return (
      <img
        src={projectsImage}
        alt="Projects Header"
        style={{
          width: "100%",
          maxWidth: "600px",
          borderRadius: "12px",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
        }}
      />
    );
  }
}
