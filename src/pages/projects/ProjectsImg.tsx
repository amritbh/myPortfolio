import React from "react";
import projectsImage from "../../assests/images/projects_header.png";

const ProjectsImg = (props: any) => {
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

export default ProjectsImg;
