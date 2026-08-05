/* Change this file to get your personal Porfolio */

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
    { icon: "☁️", label: "Cloud Architect @ HP" },
    { icon: "🏔️", label: "Nepal Trekker" },
    { icon: "✍️", label: "Technical Blogger" },
  ],
  heroStats: [
    { value: "5+", label: "Himalayan Treks" },
    { value: "10+", label: "Yrs Engineering" },
    { value: "Active", label: "Writer" },
  ],
};

const socialMediaLinks = [
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
      fileName: "DataScienceImg",
      skills: [
        "⚡ Experience with Agentic AI, Large Language Models (LLMs) and RAG",
        "⚡ Developing multi-agent AI architectures and applications",
        "⚡ Integrating Agentic AI frameworks and advanced LLMs into engineering workflows",
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
      fileName: "SoftwareImg",
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
      fileName: "DataScienceImg",
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
          fontAwesomeClassname: "logos-terraform",
          style: {
            backgroundColor: "transparent",
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
      fileName: "FullStackImg",
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
      fileName: "CloudInfraImg",
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
          fontAwesomeClassname: "logos-terraform",
          style: {
            backgroundColor: "transparent",
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
      fileName: "DesignImg",
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
