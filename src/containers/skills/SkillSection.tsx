import React from "react";
import "./Skills.css";
import SoftwareSkill from "../../components/softwareSkills/SoftwareSkill";
import { skills } from "../../portfolio";
import { Fade } from "react-reveal";
import SkillImg from "./SkillImg";
import { Theme } from "../../types";

interface SkillSectionProps {
  theme: Theme;
}

const SkillSection: React.FC<SkillSectionProps> = ({ theme }) => {
  return (
    <div>
      {skills.data.map((skill, i) => {
        return (
          <div key={i} className="skills-main-div">
            <Fade left duration={2000}>
              <div className="skills-image-div">
                <SkillImg
                  src={`https://amrit.cloud/media/skills/${skill.fileName}`}
                  alt={skill.title}
                  theme={theme}
                />
              </div>
            </Fade>

            <div className="skills-text-div">
              <Fade right duration={1000}>
                <h1 className="skills-heading" style={{ color: theme.text }}>
                  {skill.title}
                </h1>
              </Fade>
              <Fade right duration={1500}>
                <SoftwareSkill logos={skill.softwareSkills} theme={theme} />
              </Fade>
              <Fade right duration={2000}>
                <div>
                  {skill.skills.map((skillSentence, i) => {
                    return (
                      <p
                        key={i}
                        className="subTitle skills-text"
                        style={{ color: theme.secondaryText }}
                      >
                        {skillSentence}
                      </p>
                    );
                  })}
                </div>
              </Fade>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SkillSection;
