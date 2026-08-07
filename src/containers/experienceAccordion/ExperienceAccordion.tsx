import React from "react";
import ExperienceCard from "../../components/experienceCard/ExperienceCard";
import "./ExperienceAccordion.css";

const ExperienceAccordion = (props: any) => {
    const theme = props.theme;
    return (
      <div className="experience-accord">
        {props.sections.map((section) => {
          return (
            <div key={section["title"]} style={{ marginBottom: "2rem" }}>
              <h2
                style={{
                  color: theme.text,
                  marginBottom: "1.5rem",
                  fontSize: "2rem",
                  fontFamily: "Google Sans Regular",
                }}
              >
                {section["title"]}
              </h2>
              {section["experiences"].map((experience, index) => {
                return (
                  <ExperienceCard
                    key={index}
                    index={index}
                    totalCards={section["experiences"].length}
                    experience={experience}
                    theme={theme}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }
export default ExperienceAccordion;
