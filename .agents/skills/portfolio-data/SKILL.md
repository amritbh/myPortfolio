---
name: Portfolio Data Schema
description: Schema and conventions for the portfolio.js data file, theme configuration, and static content that drives all portfolio pages. Use this skill when modifying portfolio content, adding new sections, or updating personal/professional information.
---

# Portfolio Data Schema

All portfolio content is defined in `src/portfolio.js` — a single 950-line JavaScript file that exports named objects consumed by various page components.

## File: `src/portfolio.js`

### Exports

```js
export {
  settings,
  seo,
  greeting,
  socialMediaLinks,
  skills,
  competitiveSites,
  degrees,
  certifications,
  experience,
  projectsHeader,
  publicationsHeader,
  publications,
  contactPageData,
};
```

## Data Object Schemas

### `settings`

```js
const settings = {
  isSplash: false, // true → show splash screen on "/"
};
```

### `seo`

```js
const seo = {
  title: "Amrit's Portfolio",
  description: "A passionate individual...",
  og: {
    title: "Amrit Bhattarai Portfolio",
    type: "website",
    url: "https://amrit.cloud",
  },
};
```

### `greeting` (Home page hero)

```js
const greeting = {
  title: "Amrit Bhattarai",
  logo_name: "AmritBhattarai",
  subTitle: "A passionate individual...",
  resumeLink: "https://drive.google.com/...",
  portfolio_repository: "https://github.com/amritbh/myPortfolio",
  githubProfile: "https://github.com/amritbh",
};
```

### `socialMediaLinks` (Array)

```js
{
  name: "Github",
  link: "https://github.com/amritbh",
  fontAwesomeIcon: "fa-github",         // FontAwesome class
  backgroundColor: "#181717",           // SimpleIcons color
}
```

Current entries: Github, LinkedIn, YouTube, Gmail, X-Twitter

### `skills` (Home page skill sections)

```js
const skills = {
  data: [
    {
      title: "Agentic AI and LLMs",
      fileName: "DataScienceImg", // Maps to SVG component
      skills: [
        "⚡ Experience with Agentic AI...", // Always start with ⚡ emoji
      ],
      softwareSkills: [
        {
          skillName: "Python",
          fontAwesomeClassname: "ion-logo-python", // Iconify class
          style: {
            color: "#3776AB", // Icon color
            // OR backgroundColor: "transparent"
          },
        },
      ],
    },
  ],
};
```

**Skill sections** (in order):

1. Agentic AI and LLMs
2. Full Stack Software Engineer
3. DevOps and Cloud
4. Site Reliability Engineering
5. Cloud Infra-Architecture
6. Network and System Administration

**Icon class formats:**

- `ion-logo-*` — Ionicons
- `simple-icons:*` — Simple Icons
- `logos-*` — Logos (SVG Logos)
- `fa-*` — FontAwesome

### `competitiveSites`

```js
{
  siteName: "LeetCode",
  iconifyClassname: "simple-icons:leetcode",
  style: { color: "#F79F1B" },
  profileLink: "https://leetcode.com/amrit.bh/",
}
```

### `degrees` (Education page)

```js
{
  title: "Maharishi International University",
  subtitle: "Master of Science in Computer Science",
  logo_path: "miu_banner.png",          // In src/assests/images/
  alt_name: "MIU",
  duration: "2023 - 2025",
  descriptions: [
    "⚡ Completed a Master of Science...",
  ],
  website_link: "https://www.miu.edu/",
}
```

### `certifications`

```js
{
  title: "AWS Solution Architect Associate",
  subtitle: "Completed Udemy Course",
  logo_path: "aws_logo.jpeg",           // In src/assests/images/
  certificate_link: "https://...",
  alt_name: "AWS",
  color_code: "#FF9900",                // Card background color
}
```

### `experience` (Experience page)

```js
const experience = {
  title: "Experience",
  subtitle: "",
  description: "Software Cloud and DevOps/SRE Engineer...",
  header_image_path: "experience.svg",
  sections: [
    {
      title: "Work",
      work: true,
      experiences: [
        {
          title: "Sr. Software Engineer - Cloud Architect (Agentic AI)",
          company: "HP",
          company_url: "https://www.hp.com/",
          logo_path: "hp_logo.svg", // In src/assests/images/
          duration: "Jun 2026 - Present",
          location: "Corvallis, Oregon, United States",
          description: `• Lead the end-to-end architecture...`, // Template literal with bullet points
          color: "#0096D6", // Timeline dot color
        },
      ],
    },
  ],
};
```

**Experience entries** (chronological, newest first):

1. HP — Sr. Software Engineer - Cloud Architect (Agentic AI)
2. Sam's Club / Walmart — Software Engineer
3. PB Group — Sr. Cloud Software Engineer
4. WorldLink Communications — Infrastructure Engineer
5. Islington College — Information Technology Engineer

### `projectsHeader`

```js
{
  title: "Projects",
  description: "My projects makes use of...",
  avatar_image_path: "projects_image.svg",
}
```

### `publications`

```js
{
  data: [
    {
      id: "deploy-portfolio-website-on-aws",
      name: "How to Deploy Your Portfolio...",
      createdAt: "2024-04-15T00:00:00Z",
      description: "Blog published on Medium...",
      url: "https://medium.com/@amrit.bhattarai990/...",
    },
  ],
}
```

### `contactPageData`

```js
{
  contactSection: {
    title: "Contact Me",
    profile_image_path: "animated_amrit.jpeg",
    description: "I am available on almost every social media...",
  },
  blogSection: {
    title: "Blogs",
    subtitle: "I like to document...",
    link: "https://medium.com/...",
    avatar_image_path: "blogs_image.svg",
  },
  addressSection: {
    title: "Address",
    subtitle: "960 SW Washington Ave...",
    locality: "Corvallis",
    country: "USA",
    region: "Oregon",
    postalCode: "97333",
    streetAddress: "960 SW Washington Ave, Apt 234A, Box 65",
    avatar_image_path: "address_image.svg",
    location_map_link: "https://www.google.com/maps/...",
  },
  phoneSection: {
    title: "",
    subtitle: "",
  },
}
```

## Theme Configuration (`src/theme.js`)

Currently active: `export const chosenTheme = blueTheme;`

To change the theme, update the `chosenTheme` export to any of the 14 available themes.

Theme object properties (all themes have the same shape):

- `body`, `text`, `expTxtColor`, `highlight`, `dark`, `secondaryText`
- `imageHighlight`, `compImgHighlight`, `jacketColor`, `headerColor`, `splashBg`

## Static Assets

### Image directory: `src/assests/images/` ⚠️ (typo is intentional)

Logo images referenced by `logo_path` fields are loaded from this directory.
Import pattern in components:

```js
require(`../../assests/images/${logo_path}`);
```

SVG illustrations referenced by `fileName` fields map to React components in `src/containers/` or `src/components/`.

## Checklist: Updating Portfolio Content

1. Edit the appropriate object in `src/portfolio.js`
2. Follow the existing schema exactly (same keys, same types)
3. Skill descriptions: always start with `⚡` emoji
4. Experience descriptions: use template literals with `•` bullet points
5. Images: place new logos/images in `src/assests/images/` (note the typo)
6. Icon classes: use iconify format (check https://icon-sets.iconify.design/)
7. Dates: use ISO format for `publishDate`/`createdAt`, human format for `duration`
8. Test locally with `npm start` to verify rendering
