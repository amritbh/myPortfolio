import React from "react";
import { render, screen } from "@testing-library/react";
import ExperienceAccordion from "./ExperienceAccordion";

// Mock ExperienceCard to avoid deep rendering complexities
jest.mock("../../components/experienceCard/ExperienceCard", () => {
  return function DummyExperienceCard({ experience, index, totalCards }) {
    return (
      <div data-testid={`experience-card-${index}`}>{experience.title}</div>
    );
  };
});

describe("ExperienceAccordion Component", () => {
  const mockTheme = {
    text: "#ffffff",
    body: "#000000",
    headerColor: "#cccccc",
    secondaryText: "#dddddd",
  };

  const mockSections = [
    {
      title: "Work Experience",
      experiences: [
        {
          title: "Software Engineer",
          company: "Tech Corp",
          duration: "Jan 2020 - Present",
          description: "Did some cool stuff.",
        },
        {
          title: "Junior Developer",
          company: "Old Corp",
          duration: "Jan 2018 - Dec 2019",
          description: "Did some other stuff.",
        },
      ],
    },
    {
      title: "Internships",
      experiences: [
        {
          title: "Intern",
          company: "Intern Corp",
          duration: "Summer 2017",
          description: "Learned things.",
        },
      ],
    },
  ];

  it("renders correctly with given sections and theme", () => {
    render(<ExperienceAccordion sections={mockSections} theme={mockTheme} />);

    // Check if section titles are rendered
    expect(screen.getByText("Work Experience")).toBeInTheDocument();
    expect(screen.getByText("Internships")).toBeInTheDocument();

    // Check if correct number of ExperienceCards are rendered
    expect(screen.getAllByTestId("experience-card-0").length).toBe(2);
    expect(screen.getAllByTestId("experience-card-1").length).toBe(1);

    // Check content inside the mocked ExperienceCard
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Intern")).toBeInTheDocument();
  });

  it("handles empty sections gracefully", () => {
    render(<ExperienceAccordion sections={[]} theme={mockTheme} />);

    // The main container should still render, but empty
    const container = document.querySelector(".experience-accord");
    expect(container).toBeInTheDocument();
    expect(container.children.length).toBe(0);
  });
});
