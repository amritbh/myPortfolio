/* Change this file to get your personal Porfolio */

import type { SocialLink } from "./types";

// Website related settings
const settings = {
  isSplash: false, // Change this to false if you don't want Splash screen.
};

//SEO Related settings
const seo = {
  title: "Amrit's Portfolio",
  description:
    "A passionate individual who always thrives to work on end to end products which develop sustainable and scalable social and technical systems to create impact.",
  og: {
    title: "Amrit Bhattarai Portfolio",
    type: "website",
    url: "https://amrit.cloud",
  },
};

//Home Page
const greeting = {
  title: "Amrit Bhattarai",
  logo_name: "AmritBhattarai",
  subTitle:
    "Sr. Cloud Architect at HP, building Agentic AI systems and cloud infrastructure at scale. Nepal born, Oregon based. I write technical blogs and document adventures from Himalayan trails to Oregon coastlines.",
  resumeLink:
    "https://drive.google.com/file/d/1wu7cCnwAQny08dUcX5mnCoPap-2R4Yql/view",
  portfolio_repository: "https://github.com/amritbh/myPortfolio",
  githubProfile: "https://github.com/amritbh",
  heroChips: [
    { icon: "☁️", label: "Cloud Architect @ HP", link: "https://www.linkedin.com/in/bamrit/" },
    { icon: "🏔️", label: "Adventurer", link: "/travel" },
    { icon: "✍️", label: "Technical Blogger", link: "/blogs" },
  ],
  heroStats: [
    { value: "5+", label: "Himalayan Treks" },
    { value: "10+", label: "Yrs Engineering" },
    { value: "Active", label: "Writer" },
  ],
};

const socialMediaLinks: SocialLink[] = [
  /* Your Social Media Link */
  // github: "https://github.com/amritbh",
  // linkedin: "https://www.linkedin.com/in/bamrit/",
  // gmail: "amrit.bhattarai990@gmail.com",
  // gitlab: "https://gitlab.com/amritbh",
  // facebook: "https://www.facebook.com/amrit.bhattarai90/",
  // twitter: "https://twitter.com/amrit_bh",
  // instagram: "https://www.instagram.com/amrit.bh/"

  {
    name: "Github",
    link: "https://github.com/amritbh",
    fontAwesomeIcon: "fa-github", // Reference https://fontawesome.com/icons/github?style=brands
    backgroundColor: "#181717", // Reference https://simpleicons.org/?q=github
  },
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/bamrit/",
    fontAwesomeIcon: "fa-linkedin-in", // Reference https://fontawesome.com/icons/linkedin-in?style=brands
    backgroundColor: "#0077B5", // Reference https://simpleicons.org/?q=linkedin
  },
  {
    name: "YouTube",
    link: "https://youtube.com/c/iamritb",
    fontAwesomeIcon: "fa-youtube", // Reference https://fontawesome.com/icons/youtube?style=brands
    backgroundColor: "#FF0000", // Reference https://simpleicons.org/?q=youtube
  },
  {
    name: "Gmail",
    link: "mailto:amrit.bhattarai990@gmail.com",
    fontAwesomeIcon: "fa-google", // Reference https://fontawesome.com/icons/google?style=brands
    backgroundColor: "#D14836", // Reference https://simpleicons.org/?q=gmail
  },
  {
    name: "X-Twitter",
    link: "https://twitter.com/amrit_bh",
    fontAwesomeIcon: "fa-x-twitter", // Reference https://fontawesome.com/icons/x-twitter?f=brands&s=solid
    backgroundColor: "#000000", // Reference https://simpleicons.org/?q=x
  },
];

const skills = {
  data: [
    {
      title: "Agentic AI and LLMs",
      fileName: "skill_agentic_ai.png",
      skills: [
        "⚡ Experience with Agentic AI, Large Language Models (LLMs) and RAG",
        "⚡ Developing multi-agent AI architectures and applications",
        "⚡ Integrating Agentic AI frameworks and advanced LLMs into engineering workflows",
        "⚡ Fine-tuning and prompt engineering for state-of-the-art models like GPT-4 and Claude 3",
        "⚡ Designing self-reflecting and goal-oriented autonomous AI agents",
        "⚡ Optimizing inference latency and vector database search strategies for semantic retrieval",
      ],
      softwareSkills: [
        {
          skillName: "Python",
          fontAwesomeClassname: "ion-logo-python",
          style: {
            color: "#3776AB",
          },
        },
        {
          skillName: "OpenAI / GPT",
          fontAwesomeClassname: "simple-icons:openai",
          style: {
            color: "#412991",
          },
        },
        {
          skillName: "Anthropic / Claude",
          fontAwesomeClassname: "simple-icons:anthropic",
          style: {
            color: "#D97757",
          },
        },
        {
          skillName: "GitHub Copilot",
          fontAwesomeClassname: "simple-icons:githubcopilot",
          style: {
            color: "#000000",
          },
        },
        {
          skillName: "Amazon Bedrock",
          fontAwesomeClassname: "simple-icons:amazonaws",
          style: {
            color: "#FF9900",
          },
        },
        {
          skillName: "Microsoft AI Foundry",
          fontAwesomeClassname: "simple-icons:microsoft",
          style: {
            color: "#00A4EF",
          },
        },
        {
          skillName: "LangChain",
          fontAwesomeClassname: "simple-icons:langchain",
          style: {
            color: "#000000",
          },
        },
        {
          skillName: "CrewAI",
          fontAwesomeClassname: "simple-icons:openai",
          style: {
            color: "#00A4EF",
          },
        },
      ],
    },
    {
      title: "Full Stack Software Engineer",
      fileName: "skill_fullstack.png",
      skills: [
        "⚡ Strong experience building backend applications using Java, Python and Spring Boot",
        "⚡ Experience developing RESTful APIs and microservices",
        "⚡ Proficient in Python for scripting and backend development",
        "⚡ Building responsive frontend UIs with React",
        "⚡ Familiar with unit/integration testing, CI/CD and containerization using Docker",
      ],
      softwareSkills: [
        {
          skillName: "Java",
          fontAwesomeClassname: "simple-icons:java",
          style: {
            color: "#5382a1",
          },
        },
        {
          skillName: "Spring Boot",
          fontAwesomeClassname: "simple-icons:springboot",
          style: {
            color: "#6DB33F",
          },
        },
        {
          skillName: "Python",
          fontAwesomeClassname: "ion-logo-python",
          style: {
            color: "#3776AB",
          },
        },
        {
          skillName: "React",
          fontAwesomeClassname: "ion-logo-react",
          style: {
            color: "#61DAFB",
          },
        },
        {
          skillName: "Docker",
          fontAwesomeClassname: "simple-icons:docker",
          style: {
            backgroundColor: "transparent",
          },
        },
        {
          skillName: "Hibernate",
          fontAwesomeClassname: "simple-icons:hibernate",
          style: {
            color: "#59666C",
          },
        },
        {
          skillName: "MySQL",
          fontAwesomeClassname: "simple-icons:mysql",
          style: {
            color: "#4479A1",
          },
        },
        {
          skillName: "PostgreSQL",
          fontAwesomeClassname: "simple-icons:postgresql",
          style: {
            color: "#336791",
          },
        },
        {
          skillName: "JUnit",
          fontAwesomeClassname: "simple-icons:junit",
          style: {
            color: "#25A162",
          },
        },
        {
          skillName: "Maven",
          fontAwesomeClassname: "simple-icons:apachemaven",
          style: {
            color: "#C71A36",
          },
        },
        {
          skillName: "Kafka",
          fontAwesomeClassname: "simple-icons:apachekafka",
          style: {
            color: "#E64A19",
          },
        },
        {
          skillName: "Redis",
          fontAwesomeClassname: "simple-icons:redis",
          style: {
            color: "#D82C20",
          },
        },
        {
          skillName: "Microservices",
          fontAwesomeClassname: "simple-icons:microservices",
          style: {
            color: "#0B69B4",
          },
        },
      ],
    },
    {
      title: "DevOps and Cloud",
      fileName: "skill_devops.png",
      skills: [
        "⚡ Experience in building CI/CD pipelines for code deployment",
        "⚡ Working with various cloud platforms such as AWS, Azure, Google Cloud",
        "⚡ Experience in automating infrastructure using Terraform, Ansible",
        "⚡ Monitoring and maintaining Kubernetes clusters using Prometheus, Grafana",
        "⚡ Experience in setting up logging and monitoring using ELK stack",
        "⚡ Managing and maintaining Jenkins for CI/CD pipelines",
        "⚡ Experience in setting up and managing Docker containers",
      ],
      softwareSkills: [
        {
          skillName: "Jenkins",
          fontAwesomeClassname: "logos-jenkins",
          style: {
            backgroundColor: "transparent",
          },
        },
        //argocd

        {
          skillName: "Terraform",
          fontAwesomeClassname: "simple-icons:terraform",
          style: {
            color: "#000000",
          },
        },
        {
          skillName: "Docker",
          fontAwesomeClassname: "simple-icons:docker",
          style: {
            backgroundColor: "white",
            color: "#D00000",
          },
        },
        {
          skillName: "Ansible",
          fontAwesomeClassname: "logos-ansible",
          style: {
            backgroundColor: "transparent",
          },
        },
        {
          skillName: "Python",
          fontAwesomeClassname: "ion-logo-python",
          style: {
            backgroundColor: "transparent",
            color: "#3776AB",
          },
        },
        {
          skillName: "AWS",
          fontAwesomeClassname: "logos-aws",
          style: {
            backgroundColor: "transparent",
          },
        },
        {
          skillName: "GCP",
          fontAwesomeClassname: "simple-icons:googlecloud",
          style: {
            backgroundColor: "transparent",
          },
        },
        {
          skillName: "Azure",
          fontAwesomeClassname: "simple-icons:microsoftazure",
          style: {
            backgroundColor: "transparent",
          },
        },
        {
          skillName: "Kubernetes",
          fontAwesomeClassname: "simple-icons:kubernetes",
          style: {
            backgroundColor: "transparent",
          },
        },
        {
          skillName: "Prometheus",
          fontAwesomeClassname: "logos-prometheus",
          style: {
            backgroundColor: "transparent",
          },
        },
        {
          skillName: "Grafana",
          fontAwesomeClassname: "logos-grafana",
          style: {
            backgroundColor: "transparent",
          },
        },
        {
          skillName: "Elasticsearch",
          fontAwesomeClassname: "simple-icons:elasticsearch",
          style: {
            backgroundColor: "transparent",
          },
        },
        {
          skillName: "Logstash",
          fontAwesomeClassname: "simple-icons:logstash",
          style: {
            backgroundColor: "transparent",
          },
        },
        {
          skillName: "Kibana",
          fontAwesomeClassname: "simple-icons:kibana",
          style: {
            backgroundColor: "transparent",
          },
        },
      ],
    },
    {
      title: "Site Reliability Engineering",
      fileName: "skill_sre.png",
      skills: [
        "⚡ Experience in setting up and maintaining monitoring systems",
        "⚡ Working with various logging and monitoring tools",
        "⚡ Experience in setting up and maintaining Kubernetes clusters",
        "⚡ Experience in setting up and maintaining service mesh using istio",
        "⚡ Creating application backend in Java, Springboot & Hibernate",
        "⚡ Experience in setting up and maintaining databases",
        "⚡ worked for maintaining SLA, SLO and SLI",
      ],
      softwareSkills: [
        {
          skillName: "Istio",
          fontAwesomeClassname: "simple-icons:istio",
          style: {
            color: "#E34F26",
          },
        },
        //splunk
        {
          skillName: "Splunk",
          fontAwesomeClassname: "simple-icons:splunk",
          style: {
            color: "#000000",
          },
        },
        //prometheus and grafana
        {
          skillName: "Prometheus",
          fontAwesomeClassname: "logos-prometheus",
          style: {
            color: "#E34F26",
          },
        },
        {
          skillName: "Grafana",
          fontAwesomeClassname: "logos-grafana",
          style: {
            color: "#F46800",
          },
        },
        //elk stack
        {
          skillName: "Elasticsearch",
          fontAwesomeClassname: "simple-icons:elasticsearch",
          style: {
            color: "#005571",
          },
        },
        {
          skillName: "Logstash",
          fontAwesomeClassname: "simple-icons:logstash",
          style: {
            color: "#005571",
          },
        },
        {
          skillName: "Kibana",
          fontAwesomeClassname: "simple-icons:kibana",
          style: {
            color: "#005571",
          },
        },
        //load testing
        {
          skillName: "JMeter",
          fontAwesomeClassname: "simple-icons:apachejmeter",
          style: {
            color: "#000000",
          },
        },
      ],
    },
    {
      title: "Cloud Infra-Architecture",
      fileName: "skill_cloud_infra.png",
      skills: [
        "⚡ Experience working on multiple cloud platforms",
        "⚡ Hosting and maintaining websites on virtual machine instances along with integration of databases",
        "⚡ Deploying deep learning models on cloud to use on mobile devices",
        "⚡ Setting up streaming jobs from DB to Server or vice-versa on Azure, GCP and AWS",
        //terraform
        "⚡ Experience in automating infrastructure using Terraform, Ansible",
        //kubernetes eks and aks
        "⚡ Experience in setting up and maintaining Kubernetes clusters",
      ],
      softwareSkills: [
        {
          skillName: "GCP",
          fontAwesomeClassname: "simple-icons:googlecloud",
          style: {
            color: "#4285F4",
          },
        },
        {
          skillName: "AWS",
          fontAwesomeClassname: "simple-icons:amazonaws",
          style: {
            color: "#FF9900",
          },
        },
        {
          skillName: "Azure",
          fontAwesomeClassname: "simple-icons:microsoftazure",
          style: {
            color: "#0089D6",
          },
        },
        {
          skillName: "Firebase",
          fontAwesomeClassname: "simple-icons:firebase",
          style: {
            color: "#FFCA28",
          },
        },
        {
          skillName: "PostgreSQL",
          fontAwesomeClassname: "simple-icons:postgresql",
          style: {
            color: "#336791",
          },
        },
        {
          skillName: "MongoDB",
          fontAwesomeClassname: "simple-icons:mongodb",
          style: {
            color: "#47A248",
          },
        },
        {
          skillName: "Docker",
          fontAwesomeClassname: "simple-icons:docker",
          style: {
            color: "#1488C6",
          },
        },
        {
          skillName: "Kubernetes",
          fontAwesomeClassname: "simple-icons:kubernetes",
          style: {
            color: "#326CE5",
          },
        },
        //terraform
        {
          skillName: "Terraform",
          fontAwesomeClassname: "simple-icons:terraform",
          style: {
            color: "#000000",
          },
        },
        //ansible
        {
          skillName: "Ansible",
          fontAwesomeClassname: "logos-ansible",
          style: {
            backgroundColor: "transparent",
          },
        },
      ],
    },
    {
      title: "Network and System Administration",
      fileName: "skill_networking.png",
      skills: [
        "⚡ Experience in setting up and maintaining network infrastructure",
        //settig up virtual network in aws and azure
        "⚡ Setting up virtual networks in AWS and Azure",
        //network security
        "⚡ Experience in network security",
        //firewall
        "⚡ Setting up and maintaining firewalls",
        //linux and windows server adminstration
        "⚡ Experience in Linux and Windows Server Administration",
        //network monitoring
        "⚡ Experience in network monitoring using Nagios and SolarWinds",
      ],
      softwareSkills: [
        {
          skillName: "Adobe XD",
          fontAwesomeClassname: "simple-icons:adobexd",
          style: {
            color: "#FF2BC2",
          },
        },
        //aws
        {
          skillName: "AWS",
          fontAwesomeClassname: "simple-icons:amazonaws",
          style: {
            color: "#FF9900",
          },
        },
        //azure
        {
          skillName: "Azure",
          fontAwesomeClassname: "simple-icons:microsoftazure",
          style: {
            color: "#0089D6",
          },
        },

        //solarwinds
        {
          skillName: "SolarWinds",
          fontAwesomeClassname: "logos:solarwinds",
          style: {
            color: "#000000",
          },
        },
        //linux
        {
          skillName: "Linux",
          fontAwesomeClassname: "simple-icons:linux",
          style: {
            color: "#000000",
          },
        },
        //windows
        {
          skillName: "Windows",
          fontAwesomeClassname: "simple-icons:windows",
          style: {
            color: "#000000",
          },
        },
        //vmware
        {
          skillName: "VMware",
          fontAwesomeClassname: "simple-icons:vmware",
          style: {
            color: "#000000",
          },
        },
        //cisco
        {
          skillName: "Cisco",
          fontAwesomeClassname: "simple-icons:cisco",
          style: {
            color: "#000000",
          },
        },
      ],
    },
  ],
};

// Education Page
const competitiveSites = {
  competitiveSites: [
    {
      siteName: "LeetCode",
      iconifyClassname: "simple-icons:leetcode",
      style: {
        color: "#F79F1B",
      },
      profileLink: "https://leetcode.com/amrit.bh/",
    },
    {
      siteName: "HackerRank",
      iconifyClassname: "simple-icons:hackerrank",
      style: {
        color: "#2EC866",
      },
      profileLink: "https://www.hackerrank.com/bamrit",
    },
    {
      siteName: "Codechef",
      iconifyClassname: "simple-icons:codechef",
      style: {
        color: "#5B4638",
      },
      profileLink: "https://www.codechef.com/users/bamrit",
    },
    {
      siteName: "Codeforces",
      iconifyClassname: "simple-icons:codeforces",
      style: {
        color: "#1F8ACB",
      },
      profileLink: "https://codeforces.com/profile/layman_brother",
    },
    {
      siteName: "Hackerearth",
      iconifyClassname: "simple-icons:hackerearth",
      style: {
        color: "#323754",
      },
      profileLink: "https://www.hackerearth.com/@Amrit391",
    },
    {
      siteName: "Kaggle",
      iconifyClassname: "simple-icons:kaggle",
      style: {
        color: "#20BEFF",
      },
      profileLink: "https://www.kaggle.com/laymanbrother",
    },
  ],
};

const degrees = {
  degrees: [
    {
      title: "Maharishi International University",
      subtitle: "Master of Science in Computer Science",
      logo_path: "miu_banner.png",
      alt_name: "MIU",
      duration: "2023 - 2025",
      descriptions: [
        "⚡ Completed a Master of Science in Computer Science with coursework in Enterprise Architecture, Big Data,Web Application Architecture, Cloud Computing, Software Architecture, AI & ML, and Algorithms.",
        "⚡ Delivered projects and labs focused on programming, automation, and cloud-based deployments to solve practical problems.",
        "⚡ Applied theoretical foundations to design and implement scalable, maintainable systems in team and independent settings.",
      ],
      website_link: "https://www.miu.edu/",
    },
    {
      title: "London Metropolitan University, Islington College",
      subtitle: "BSc IT(Hons.) in Computer Networking & IT Security",
      logo_path: "lmu_logo.png",
      alt_name: "London Metropolitan University",
      duration: "2011 - 2015",
      descriptions: [
        "⚡ I have studied core subjects such as Data Structures, Algorithms, Database Management Systems, Operating Systems, Computer Architecture, and Artificial Intelligence.",
        "⚡ Additionally, I completed courses on Network Security, Ethical Hacking, and IT Infrastructure Management.",
        "⚡ My academic performance was consistently excellent, earning me a place among the top students in my cohort.",
      ],
      website_link: "https://www.londonmet.ac.uk/",
    },
  ],
};

const certifications = {
  certifications: [
    {
      title: "AWS Solution Architect Associate",
      subtitle: "Completed Udemy Course",
      logo_path: "aws_logo.jpeg",
      certificate_link: "https://www.udemy.com/certificate/ABC123",
      alt_name: "AWS",
      color_code: "#FF9900",
    },
    {
      title: "CCNA",
      subtitle: "Academically Completed",
      logo_path: "cisco_logo.jpeg",
      certificate_link: "https://www.cisco.com/certificates/XYZ456",
      alt_name: "Cisco",
      color_code: "#1BA0D7",
    },
    {
      title: "Certified Kubernetes Administrator (CKA)",
      subtitle: "Completed KodeKloud Online Course",
      logo_path: "cka_logo.png",
      certificate_link: "https://www.kodekloud.com/certificates/DEF789",
      alt_name: "CNCF",
      color_code: "#326CE5",
    },
    {
      title: "Azure Administrator",
      subtitle: "Completed Udemy Course",
      logo_path: "azure_logo.jpeg",
      certificate_link: "https://www.udemy.com/certificate/XYZ123",
      alt_name: "Azure",
      color_code: "#0078D4",
    },
  ],
};

// Experience Page
const experience = {
  title: "Experience",
  subtitle: "",
  description:
    "Software Cloud and DevOps/SRE Engineer with over 8 years of expertise spanning backend development, cloud infrastructure, and Site Reliability Engineering. I specialize in designing highly scalable, multi-cloud architectures (AWS, Azure, GCP), automating DevSecOps pipelines, and driving operational excellence while integrating advanced AI technologies.",
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
          logo_path: "hp_logo.svg",
          duration: "Jun 2026 - Present",
          location: "Corvallis, Oregon, United States",
          description: `• Lead the end-to-end architecture design and setup of a highly scalable AWS environment for distributed, multi-agent AI systems.
• Engineer foundational AWS topology, optimizing high-performance compute clusters, secure networking (VPCs), IAM/OIDC security, and cost governance.
• Deploy and orchestrate specialized AI agents (Claude, LLMs), establishing secure cross-agent communication protocols and stateful memory persistence.
• Architect modular Infrastructure as Code (IaC) utilizing Terraform and Terragrunt to manage AWS resources and eliminate manual deployment bottlenecks.
• Design and build comprehensive GitHub Actions CI/CD pipelines for continuous integration and delivery of infrastructure and Python-based agentic applications.
• Develop advanced automation scripts utilizing Python and Bash to streamline system configuration and manage container lifecycles.
• Integrate Agentic AI frameworks (Copilot, Claude, Gemini, ChatGPT) into daily engineering workflows to accelerate infrastructure code generation and optimize state management.`,
          color: "#0096D6",
        },
        {
          title: "Software Engineer - Development, DevOps, Cloud & SRE",
          company: "Sam's Club / Walmart Inc.",
          company_url: "https://www.samsclub.com/",
          logo_path: "walmart_logo.svg",
          duration: "Oct 2024 - Present",
          location: "Arkansas, United States",
          description: `Project: ATLAS - Warehouse Management System (WMS) (Java, Spring Boot, Python, Microservices, React, SQL, NoSQL, Kafka, IBMMQ)

• Enhanced fault tolerance and scalability of Atlas WMS, ensuring zero downtime for critical operations.
• Designed resilient autoscaling architectures using KEDA and messaging queues, improving cluster stability and reducing resource waste.
• Migrated applications across 15 sites, providing go-live support, L3 incident resolution via xMatters, and root cause analysis.
• Engineered custom deployments across Walmart Cloud Native Platform (WCNP), a multi-cloud abstraction layer on GCP, Azure, OpenShift, and OpenStack.
• Migrated legacy applications to a GCP/Azure-integrated platform utilizing Terraform for 99.99% uptime.
• Automated DevSecOps and deployments using Terraform, Terragrunt, Ansible, Snyk, SonarQube, and central configuration tools.
• Reduced MTTR by deploying AI-powered agents to troubleshoot CI/CD pipeline failures across 200+ internal services.
• Implemented robust observability pipelines using Prometheus, Grafana, Open Observe, DynaTrace, Datadog, and Splunk.
• Managed Azure Databricks workspaces for data governance and scalable GCP event-driven messaging using Pub/Sub, BigQuery, and Airflow.`,
          color: "#000000",
        },
        {
          title: "Sr. Cloud Software Engineer",
          company: "PB Group Pvt. Ltd.",
          company_url: "https://pbg.com.np/",
          logo_path: "pbg_logo.png",
          duration: "Aug 2022 - Jan 2023",
          location: "Kathmandu, Bagmati, Nepal",
          description: `• Developed jobs automation and created CI/CD pipelines using GitHub Actions, Azure DevOps, Jenkins, and GitLab to deploy to AWS EKS and Azure AKS clusters.
• Engineered backend services in Java and Python, containerizing with Docker for scalable microservices deployments.
• Provisioned and bootstrapped VMs using Terraform and Ansible, achieving a ~70% reduction in deployment time.
• Set up Prometheus and Grafana to monitor Kubernetes clusters, creating custom dashboards for performance metrics visualization.
• Implemented a robust DevSecOps framework by integrating Snyk, OWASP, and SonarQube into CI/CD pipelines.
• Maintained comprehensive documentation for multi-cloud infrastructure (AWS and Azure) automation workflows.
• Automated network configuration tasks with custom Python and Bash scripts, significantly improving accuracy and efficiency.
• Configured and managed NGINX as a reverse proxy and NGINX Ingress Controller for traffic routing, load balancing, and SSL.`,
          color: "#000000",
        },
        {
          title:
            "Infrastructure Engineer - Cloud, Monitoring, Development, DevOps",
          company: "WorldLink Communications Ltd.",
          company_url: "https://worldlink.com.np/",
          logo_path: "worldlink_logo.png",
          duration: "Apr 2016 - Jun 2022",
          location: "Kathmandu, Bagmati, Nepal",
          description: `• Developed high-traffic video streaming and monitoring applications (NetTV, myWorldlink) using Java, Spring Boot, Kafka, and Python.
• Transitioned legacy monolithic applications to containerized microservices architectures, significantly reducing downtime and doubling scalability.
• Engineered robust CI/CD pipelines with Jenkins and GitOps (ArgoCD), deploying to AWS EKS and Azure AKS.
• Automated cloud infrastructure provisioning (AWS, Azure) using Terraform and Ansible, cutting deployment times by ~70% and saving up to 50% in cloud costs.
• Implemented comprehensive observability and tracing using OpenTelemetry, Prometheus, Grafana, Splunk, and New Relic to reduce MTTR.
• Ensured high availability and system resilience by managing SLOs/SLAs, deploying Istio service mesh, and migrating workloads across clouds with zero downtime.
• Built automated DataOps pipelines with PySpark and Airflow while managing backup, disaster recovery, and PKI security systems.`,
          color: "#000000",
        },
        {
          title: "Information Technology Engineer",
          company: "Islington College Kathmandu",
          company_url: "https://www.islington.edu.np/",
          logo_path: "islington_logo.png",
          duration: "Jan 2015 - Mar 2016",
          location: "Kathmandu, Bagmati, Nepal",
          description: `• Maintained 24/7 on-call rotation for high-priority incident response, ensuring rapid resolution and system uptime.
• Proactively monitored infrastructure using SolarWinds to identify, diagnose, and resolve connectivity, performance, and security issues.
• Delivered L1/L2/L3 support for mission-critical applications, minimizing downtime and achieving 99% SLA compliance.
• Troubleshot complex issues across Java/.NET backends, databases, APIs, and middleware, implementing root cause fixes to reduce recurrence by 30%.
• Managed Linux-based systems (hardware, LVM, networking, LDAP, storage) and VMware/Hyper-V BareMetal hypervisors for optimized virtualization.
• Administered user and device management in Windows Server 2012 R2, enforcing access controls and policies.
• Automated routine support tasks with Python and Shell scripts, streamlining workflows and cutting manual effort by 40%.`,
          color: "#fc1f20",
        },
      ],
    },
    // {
    //   title: "Internships",

    // },
    // {
    //   title: "Volunteerships",

    // },
  ],
};

// Projects Page
const projectsHeader = {
  title: "Projects & AI Trends",
  description:
    "Welcome to my project space! Here you'll find a mix of my past GitHub work, a sneak peek into what I'm building next, and a curated list of the open-source AI and Agentic LLM tools that I'm currently obsessed with.",
  avatar_image_path: "projects_header.png",
};

const aiOpenSourceData = {
  title: "AI & Agentic AI Ecosystem",
  data: [
    {
      id: "llama3",
      name: "Meta Llama 3",
      description:
        "State-of-the-art open large language model by Meta, enabling developers to build sophisticated AI applications.",
      releaseDate: "April 2024",
      url: "https://llama.meta.com/",
    },
    {
      id: "mistral",
      name: "Mistral Large & Mixtral",
      description:
        "Highly efficient models with sparse mixture-of-experts (SMoE) architecture, rivaling proprietary models.",
      releaseDate: "Early 2024",
      url: "https://mistral.ai/",
    },
    {
      id: "autogpt",
      name: "AutoGPT & Agentic AI",
      description:
        "Experimental open-source attempts to make GPT-4 fully autonomous, chaining LLM thoughts for complex tasks.",
      releaseDate: "Trending 2023-2024",
      url: "https://github.com/Significant-Gravitas/AutoGPT",
    },
    {
      id: "langchain",
      name: "LangChain",
      description:
        "Framework for developing applications powered by language models, heavily used in agentic architectures.",
      releaseDate: "Ongoing Updates",
      url: "https://www.langchain.com/",
    },
    {
      id: "huggingface",
      name: "Hugging Face Transformers",
      description:
        "The leading open-source library for machine learning, providing thousands of pre-trained models for NLP, vision, and audio.",
      releaseDate: "Core Ecosystem",
      url: "https://huggingface.co/",
    },
    {
      id: "ollama",
      name: "Ollama",
      description:
        "A tool to get up and running with large language models locally, bringing open-source AI to personal machines seamlessly.",
      releaseDate: "Trending 2024",
      url: "https://ollama.com/",
    },
  ],
};

const upcomingProjectsData = {
  title: "Upcoming & Relevant Projects",
  data: [
    {
      id: "agentic-cli",
      name: "Agentic Developer CLI",
      description:
        "A command-line interface tool powered by local LLMs to assist developers in scaffolding and debugging code automatically.",
      status: "In Progress",
      url: "#",
    },
    {
      id: "ai-portfolio-builder",
      name: "AI Portfolio Generator",
      description:
        "A web application that takes a user's resume and dynamically generates a personalized, heavily animated React portfolio.",
      status: "Planning",
      url: "#",
    },
  ],
};

const publicationsHeader = {
  title: "Publications",
  description: "Some of my published Articles, Blogs and Research.",
  avatar_image_path: "projects_image.svg",
};

const publications = {
  data: [
    {
      id: "deploy-portfolio-website-on-aws",
      name:
        "How to Deploy Your Portfolio Website on AWS Using Serverless Services",
      createdAt: "2024-04-15T00:00:00Z",
      description:
        "Blog published on Medium about deploying a portfolio website on AWS using serverless services",
      url:
        "https://medium.com/@amrit.bhattarai990/how-to-deploy-your-portfolio-website-on-aws-using-serverless-services-40b1a00ea2e5",
    },
    {
      id: "devops-best-practices",
      name: "DevOps Best Practices",
      createdAt: "2023-01-15T00:00:00Z",
      description:
        "Blog published on Medium discussing best practices in DevOps",
      url: "https://medium.com/@amrit.bhattarai990/devops-best-practices",
    },
    {
      id: "kubernetes-deployment-strategies",
      name: "Kubernetes Deployment Strategies",
      createdAt: "2023-03-10T00:00:00Z",
      description:
        "Blog published on Medium about various deployment strategies in Kubernetes",
      url:
        "https://medium.com/@amrit.bhattarai990/kubernetes-deployment-strategies",
    },
    {
      id: "cloud-automation-with-terraform",
      name: "Cloud Automation with Terraform",
      createdAt: "2023-05-20T00:00:00Z",
      description:
        "Blog published on Medium about automating cloud infrastructure using Terraform",
      url:
        "https://medium.com/@amrit.bhattarai990/cloud-automation-with-terraform",
    },
  ],
};

// Contact Page
const contactPageData = {
  contactSection: {
    title: "Contact Me",
    profile_image_path: "animated_amrit.jpeg",
    description:
      "I am available on almost every social media. You can message me, I will reply within 24 hours. I can help you with Network & System Administration, Infra Automation, AI, DevOps, Automation, Cloud and Opensource Development.",
  },
  blogSection: {
    title: "Blogs",
    subtitle:
      "I like to document some of my experiences in professional career journey as well as some technical knowledge sharing.",
    link:
      "https://medium.com/@amrit.bhattarai990/how-to-deploy-your-portfolio-website-on-aws-using-serverless-services-40b1a00ea2e5",
    avatar_image_path: "blogs_image.svg",
  },
  addressSection: {
    title: "Address",
    subtitle: "960 SW Washington Ave, Apt 234A, Box 65, Corvallis, OR 97333",
    locality: "Corvallis",
    country: "USA",
    region: "Oregon",
    postalCode: "97333",
    streetAddress: "960 SW Washington Ave, Apt 234A, Box 65",
    avatar_image_path: "address_image.svg",
    location_map_link: "https://www.google.com/maps/place/Corvallis,+OR+97333",
  },
  phoneSection: {
    title: "",
    subtitle: "",
  },
};

// ── Travel Page Data ─────────────────────────────────────────────────────────
// Scalable, country-agnostic architecture.
// To add a new country: add one entry to countries[] below. No UI changes needed.
// To add a new destination type: add type string + CSS class .dest-type-{name}.
// ─────────────────────────────────────────────────────────────────────────────

export type DestinationDifficulty = "Easy" | "Moderate" | "Strenuous";
export type DestinationType =
  | "trek"
  | "hike"
  | "city"
  | "road-trip"
  | "nature"
  | "moto";

export interface GalleryImage {
  src: string;       // CloudFront URL to full-size image
  thumb: string;     // CloudFront URL to thumbnail (< 400px wide)
  alt: string;
  caption?: string;
}

export interface DestinationEntry {
  id: string;
  name: string;
  type: DestinationType;
  region: string;
  emoji: string;
  description: string;
  blogSlug: string | null;
  coordinates?: [number, number]; // [lat, lng]
  elevation?: string;
  duration?: string;
  difficulty?: DestinationDifficulty;
  highlight?: string;
  galleryImages?: GalleryImage[];  // optional photo gallery
}

export interface CountryEntry {
  id: string;
  name: string;
  flag: string;
  tagline: string;
  accentColor: string;
  coverTheme: string;
  destinations: DestinationEntry[];
}

export const travelData = {
  tagline:
    "From the trails of the Himalayas to the roads of Oregon, I document every journey.",
  heroStats: [
    { value: "7+", label: "Multi-Day Treks" },
    { value: "10+", label: "Day Hikes" },
    { value: "2", label: "Countries" },
  ],
  countries: [
    // ── Nepal ──────────────────────────────────────────────────────────────
    {
      id: "nepal",
      name: "Nepal",
      flag: "🇳🇵",
      tagline: "Born here. Shaped by these mountains.",
      accentColor: "#DC143C",
      coverTheme: "himalayan",
      destinations: [
        // Multi-day treks
        {
          id: "annapurna-base-camp",
          name: "Annapurna Base Camp",
          type: "trek",
          region: "Annapurna",
          emoji: "⛰️",
          coordinates: [28.5300, 83.8780],
          description:
            "The iconic trek through rhododendron forests and glacial moraines to the foot of Annapurna I.",
          elevation: "4,130m",
          duration: "12 days",
          difficulty: "Moderate",
          highlight: "Standing at the base of Annapurna I at sunrise.",
          blogSlug: null,
          galleryImages: [
            {
              src: "https://amrit.cloud/media/travel/annapurna-base-camp/gallery/01-trail.jpg",
              thumb: "https://amrit.cloud/media/travel/annapurna-base-camp/gallery/thumbs/01-trail-thumb.jpg",
              alt: "Trail through rhododendron forest toward Annapurna Base Camp",
              caption: "The rhododendron forests blaze red in spring.",
            },
            {
              src: "https://amrit.cloud/media/travel/annapurna-base-camp/gallery/02-base-camp.jpg",
              thumb: "https://amrit.cloud/media/travel/annapurna-base-camp/gallery/thumbs/02-base-camp-thumb.jpg",
              alt: "Annapurna Base Camp at 4130m with snow-covered peaks",
              caption: "Annapurna I (8,091m) towers above the base camp at dawn.",
            },
            {
              src: "https://amrit.cloud/media/travel/annapurna-base-camp/gallery/03-machhapuchhre.jpg",
              thumb: "https://amrit.cloud/media/travel/annapurna-base-camp/gallery/thumbs/03-machhapuchhre-thumb.jpg",
              alt: "Machhapuchhre (Fishtail) peak reflection at sunrise",
              caption: "Machhapuchhre, the sacred unclimbed peak.",
            },
          ],
        },
        {
          id: "tilicho-lake",
          name: "Tilicho Lake",
          type: "trek",
          region: "Annapurna",
          emoji: "🏔️",
          coordinates: [28.6833, 83.9833],
          description:
            "One of the highest lakes in the world, nestled in a remote valley off the Annapurna Circuit.",
          elevation: "4,919m",
          duration: "14 days",
          difficulty: "Strenuous",
          highlight: "The otherworldly silence at 4,919m with the lake frozen below.",
          blogSlug: null,
        },
        {
          id: "gosaikunda",
          name: "Gosaikunda",
          type: "trek",
          region: "Langtang",
          emoji: "🔱",
          coordinates: [28.0833, 85.4167],
          description:
            "A sacred alpine lake in the Langtang region, revered by both Hindus and Buddhists.",
          elevation: "4,380m",
          duration: "7 days",
          difficulty: "Moderate",
          highlight: "Arriving at the holy lake at dusk with pilgrims beside you.",
          blogSlug: null,
        },
        {
          id: "upper-mustang",
          name: "Upper Mustang",
          type: "trek",
          region: "Mustang",
          emoji: "🏜️",
          coordinates: [29.1833, 83.9667],
          description:
            "A restricted ancient kingdom in the rain shadow of the Himalayas, with surreal desert landscapes.",
          elevation: "3,800m",
          duration: "10 days",
          difficulty: "Moderate",
          highlight: "The red-walled city of Lo Manthang emerging from the desert plateau.",
          blogSlug: null,
        },
        {
          id: "badimalika",
          name: "Badimalika",
          type: "trek",
          region: "Far West",
          emoji: "🚶",
          coordinates: [29.4167, 81.6500],
          description:
            "A sacred peak in the remote far-western hills, rarely visited and spiritually significant.",
          elevation: "4,542m",
          duration: "8 days",
          difficulty: "Strenuous",
          highlight: "Reaching a summit that few outsiders have ever stood on.",
          blogSlug: null,
        },
        // Day hikes
        {
          id: "aama-yangri",
          name: "Aama Yangri",
          type: "hike",
          region: "Langtang",
          emoji: "🌄",
          coordinates: [28.0667, 85.5500],
          description:
            "A stunning sunrise hike near Kathmandu with 360-degree views of the Langtang range.",
          elevation: "2,520m",
          duration: "1-2 days",
          difficulty: "Easy",
          highlight: "Watching dawn break over a sea of clouds above Kathmandu.",
          blogSlug: null,
        },
        {
          id: "sarangkot-hike",
          name: "Sarangkot Sunrise Hike",
          type: "hike",
          region: "Annapurna",
          emoji: "🌅",
          coordinates: [28.2439, 83.9486],
          description:
            "Classic Pokhara day hike to the Sarangkot viewpoint for a sunrise panorama of the Annapurna range.",
          elevation: "1,592m",
          duration: "Half day",
          difficulty: "Easy",
          highlight: "Machhapuchhre glowing pink before the sun clears the ridge.",
          blogSlug: null,
        },
        // City
        {
          id: "pokhara",
          name: "Pokhara",
          type: "city",
          region: "Annapurna",
          emoji: "⛵",
          coordinates: [28.2096, 83.9856],
          description:
            "The gateway to the Annapurnas, with pristine Phewa Lake and unobstructed views of Machhapuchhre.",
          blogSlug: null,
        },
        // Moto
        {
          id: "nepal-mountain-roads",
          name: "Nepal Mountain Roads",
          type: "moto",
          region: "Far West",
          emoji: "🏍️",
          coordinates: [29.3000, 81.0000],
          description:
            "Documenting the raw beauty of riding through the Himalayan foothills and high-altitude passes.",
          blogSlug: null,
        },
      ],
    } as CountryEntry,

    // ── USA ────────────────────────────────────────────────────────────────
    {
      id: "usa",
      name: "United States",
      flag: "🇺🇸",
      tagline: "Discovering America, one state at a time.",
      accentColor: "#1E6FA8",
      coverTheme: "pacific",
      destinations: [
        // Day hikes
        {
          id: "crater-lake-rim",
          name: "Crater Lake Rim Walk",
          type: "hike",
          region: "Oregon",
          emoji: "🌋",
          coordinates: [42.9446, -122.1090],
          description:
            "A rim hike around the deepest lake in the USA, formed in the caldera of a collapsed volcano.",
          elevation: "2,487m",
          duration: "Half day",
          difficulty: "Easy",
          highlight: "The impossible blue of the water, unlike anything I have seen.",
          blogSlug: null,
        },
        {
          id: "california-dunes",
          name: "California Dunes",
          type: "hike",
          region: "Pacific Coast",
          emoji: "🏜️",
          coordinates: [35.1011, -120.6145],
          description:
            "Coastal sand dunes near Pismo Beach — surreal to hike from the ocean into a mini desert.",
          elevation: "90m",
          duration: "Half day",
          difficulty: "Easy",
          highlight: "Standing on a dune ridge with the Pacific on one side and dunes on the other.",
          blogSlug: null,
        },
        // Cities and places
        {
          id: "corvallis-oregon",
          name: "Corvallis, Oregon",
          type: "city",
          region: "Pacific Northwest",
          emoji: "🌲",
          coordinates: [44.5646, -123.2620],
          description:
            "Home base since 2025. Lush forests, university town, and gateway to the Oregon Coast.",
          blogSlug: null,
        },
        {
          id: "oregon-coast",
          name: "Oregon Coast Drive",
          type: "road-trip",
          region: "Pacific Coast",
          emoji: "🌊",
          coordinates: [44.6368, -124.0535],
          description:
            "US-101 along the Oregon coast is one of the most dramatic drives in the country.",
          blogSlug: null,
        },
        {
          id: "texas",
          name: "Texas",
          type: "city",
          region: "South",
          emoji: "🤠",
          coordinates: [30.2672, -97.7431],
          description:
            "Big skies, bigger portions, and the friendliest strangers. Everything really is larger here.",
          blogSlug: null,
        },
        {
          id: "bentonville-arkansas",
          name: "Bentonville, Arkansas",
          type: "city",
          region: "Midwest",
          emoji: "🚵",
          coordinates: [36.3729, -94.2088],
          description:
            "The mountain biking capital of America. Surprised me with its incredible trail network.",
          blogSlug: null,
        },
        {
          id: "iowa",
          name: "Iowa",
          type: "city",
          region: "Midwest",
          emoji: "🌽",
          coordinates: [41.5868, -93.6250],
          description:
            "Flat, green, and underrated. A slice of classic American heartland.",
          blogSlug: null,
        },
        {
          id: "virginia-dc",
          name: "Virginia / DC Metro",
          type: "city",
          region: "East Coast",
          emoji: "🏛️",
          coordinates: [38.9072, -77.0369],
          description:
            "History everywhere you look. The Mall, cherry blossoms, and Blue Ridge Mountains nearby.",
          blogSlug: null,
        },
        {
          id: "las-vegas",
          name: "Las Vegas, Nevada",
          type: "city",
          region: "Southwest",
          emoji: "🎰",
          coordinates: [36.1699, -115.1398],
          description:
            "The Strip in all its surreal neon glory. Also a great base for Red Rock Canyon and Valley of Fire.",
          blogSlug: null,
        },
        {
          id: "arizona",
          name: "Arizona",
          type: "nature",
          region: "Southwest",
          emoji: "🌵",
          coordinates: [34.8697, -111.7610],
          description:
            "Canyon country at its finest. Sedona red rocks, Saguaro cacti, and desert sunsets.",
          blogSlug: null,
        },
      ],
    } as CountryEntry,

    // ── ADD NEW COUNTRY HERE ───────────────────────────────────────────────
    // {
    //   id: "japan",
    //   name: "Japan",
    //   flag: "🇯🇵",
    //   tagline: "Temples, ramen, and bullet trains.",
    //   accentColor: "#BC002D",
    //   coverTheme: "japan",
    //   destinations: [
    //     { id: "fuji", name: "Mt. Fuji", type: "hike", region: "Chubu", emoji: "🗻",
    //       description: "Iconic volcanic summit hike at dawn.", elevation: "3,776m",
    //       duration: "1 day", difficulty: "Moderate",
    //       highlight: "Watching sunrise above the clouds from the summit.", blogSlug: null },
    //     { id: "kyoto", name: "Kyoto", type: "city", region: "Kansai", emoji: "⛩️",
    //       description: "Ancient temples, bamboo forests, and matcha everything.", blogSlug: null },
    //   ],
    // } as CountryEntry,
  ],
};

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
  aiOpenSourceData,
  upcomingProjectsData,
  contactPageData,
};
