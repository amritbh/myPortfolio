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
    url: "http://amrit.cloud",
  },
};

//Home Page
const greeting = {
  title: "Amrit Bhattarai",
  logo_name: "AmritBhattarai",
  //nickname: "be-amrit",
  subTitle:
    "A passionate individual who always thrives to work on end to end products which develop sustainable and scalable social and technical systems to create impact.",
  resumeLink:
    "https://drive.google.com/file/d/1wu7cCnwAQny08dUcX5mnCoPap-2R4Yql/view",
  portfolio_repository: "https://github.com/amritbh/myPortfolio",
  githubProfile: "https://github.com/amritbh",
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
  {
    name: "Facebook",
    link: "https://www.facebook.com/bhattarai.amrit90/",
    fontAwesomeIcon: "fa-facebook-f", // Reference https://fontawesome.com/icons/facebook-f?style=brands
    backgroundColor: "#1877F2", // Reference https://simpleicons.org/?q=facebook
  },
  {
    name: "Instagram",
    link: "https://www.instagram.com/amrit.bh/",
    fontAwesomeIcon: "fa-instagram", // Reference https://fontawesome.com/icons/instagram?style=brands
    backgroundColor: "#E4405F", // Reference https://simpleicons.org/?q=instagram
  },
];

const skills = {
  data: [
    {
      title: "Full Stack Software Engineer",
      fileName: "SoftwareImg",
      skills: [
        "⚡ Strong experience building backend applications using Java and Spring Boot",
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
      profileLink: "http://codeforces.com/profile/layman_brother",
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
  subtitle: "Work, Internship and Volunteership",
  description:
    "I am a cross-functional engineer with experience spanning software development, site reliability, DevOps, cloud and network operations across startups and large enterprises. I design, build and operate resilient, secure, and observable distributed systems; automate infrastructure and CI/CD; lead migrations, launches and runbooks; and collaborate closely with product, security and operations teams. I also mentor engineers, contribute to open-source projects, and focus on delivering reliable systems and measurable business outcomes at scale.",
  header_image_path: "experience.svg",
  sections: [
    {
      title: "Work",
      work: true,
      experiences: [
        {
          title: "Software Engineer - Development, DevOps, Cloud & SRE",
          company: "Sam's Club / Walmart Inc.",
          company_url: "https://www.samsclub.com/",
          logo_path: "projects_image.svg",
          duration: "Oct 2024 - Present",
          location: "Arkansas, United States",
          description: [
            "Atlas is a warehouse management system (WMS) suite used by Walmart Distribution Centers (DCs) and Fulfillment Centers (FCs) to manage daily operations. It replaces multiple legacy WMS systems, streamlining processes and reducing the cost and complexity of supporting many disparate systems across DCs.",
            "Developed, debugged and maintained Java Spring Boot microservices for the Loading Server (inter-DC freight transport) and Allocation Order Services (AOS) modules that handle pallet distribution in delivery workflows.",
            "Created Bash automation scripts for Linux system administration tasks (log rotation, service monitoring), reducing manual intervention by ~30%.",
            "Managed Linux-based Kubernetes clusters (WCNP) on Azure; used Ansible Tower to orchestrate deployments and updates, improving deployment efficiency and uptime.",
            "Led GLS-to-Atlas migration activities and converted 15 sites successfully.",
            "Delivered hyper-care, soft launch and go-live support; provided L3 incident resolution for escalations routed via xMatters.",
            "Collaborated across ATLAS components (GDM, Scheduler, Receiving, Inventory, Shore, Spire, OT/OP, Merchandise Movement, DC Fin, FIX-IT) to ensure smooth integration and data flow.",
            "Implemented Infrastructure as Code (Terraform) to provision and manage cloud resources in Azure and GCP consistent with security and architecture standards.",
            "Utilized Lenses for Kafka and Hyte Console for IBM MQ to manage and monitor streaming/messaging platforms.",
            "Debugged services, performed root-cause analysis, and implemented fixes to improve system stability and performance.",
            "Worked with MS SQL for data persistence and retrieval.",
            "Played a key role in bringing a new distribution center into production while maintaining module-specific configuration, performance, and data integrity.",
            "Worked on WCNP (Walmart Cloud Native Platform) — a PaaS layer built on Azure and GCP — to host Sam's/Walmart applications.",
            "Integrated security tooling into CI/CD pipelines (SAST, container scans, secrets detection) in collaboration with cybersecurity and compliance teams.",
            "Managed CRQs for production deployments and used CCM2, Venafi, PassPass and Akeyless for centralized secure credential management.",
            "Integrated Splunk and OpenObserve for centralized logs, tracing and analysis; implemented AI-assisted pipeline debugging and AI chatbots to accelerate incident resolution.",
            "Maintained CI/CD pipelines in Looper Pro (Jenkins-based), and used Prometheus & Grafana to monitor Kubernetes clusters with custom dashboards for visibility.",
          ],
          color: "#000000",
        },
        {
          title: "Software Cloud Engineer",
          company: "PB Group Pvt. Ltd.",
          company_url: "https://pbg.com.np/",
          logo_path: "pbg_logo.png",
          duration: "August 2022 - Jan 2023",
          location: "Kathmandu, Bagmati, Nepal",
          description: [
            "Developed job automation and CI/CD pipelines in GitLab to deploy applications to AWS EKS, reducing manual effort by ~40%.",
            "Packaged Kubernetes apps with Helm Charts and managed releases for production stability.",
            "Implemented Terraform and Ansible for VM provisioning and bootstrapping, shortening setup time by ~70%.",
            "Configured Prometheus and Grafana with custom dashboards for cluster and application observability.",
            "Managed production Kubernetes clusters to ensure high availability and scalability.",
            "Integrated security tooling (Snyk, OWASP checks, SonarQube) into pipelines for automated security scanning.",
          ],
          color: "#000000",
        },
        {
          title:
            "Software Engineer - Java, Spring Boot, React, DevOps, Cloud, SRE",
          company: "Worldlink Communications Ltd.",
          company_url: "https://worldlink.com.np/",
          logo_path: "worldlink_logo.png",
          duration: "January 2018 - June 2022",
          location: "Kathmandu, Bagmati, Nepal",
          description: [
            "Managed and monitored ISP on-premises and AWS cloud networks, including VPC, Security Groups, ALB/NLB, Route 53, Direct Connect, and Transit Gateway.",
            "Built infrastructure for deploying an IPTV product on AWS and maintained production operations.",
            "Established CI/CD pipelines with Jenkins and deployed applications to AWS EKS using Terraform and ArgoCD (GitOps).",
            "Automated network and infrastructure provisioning with Ansible and Terraform.",
            "Deployed and managed Istio service mesh to improve microservices traffic management and observability.",
            "Defined and implemented SLOs/SLA frameworks and disaster recovery (RPO/RTO) practices to increase system reliability.",
          ],
          color: "#000000",
        },
        {
          title: "Software DevOps Engineer",
          company: "Worldlink Communications Ltd.",
          company_url: "https://worldlink.com.np/",
          logo_path: "worldlink_logo.png",
          duration: "April 2016 - January 2018",
          location: "Kathmandu, Bagmati, Nepal",
          description: [
            "Designed, deployed, and maintained development and infrastructure systems for the organization.",
            "Developed an infrastructure monitoring system using Java and Python to monitor national and international network devices.",
            "Worked as a backend Java developer (Spring Boot, Hibernate, MySQL) on the Task Ticket Management System.",
            "Performed performance tuning and hardware/resource optimization for data center systems.",
            "Managed cloud infrastructure costs through analysis and optimizations, achieving up to ~50% savings.",
          ],
          color: "#000000",
        },
        {
          title: "IT Engineer",
          company: "Islington College",
          company_url: "https://www.islington.edu.np/",
          logo_path: "islington_logo.png",
          duration: "January 2015 - April 2016",
          location: "Kathmandu, Nepal",
          description: [
            "Managed Linux systems including hardware, software, LVM, networking, and storage.",
            "Administered VMware vSphere ESXi BareMetal hypervisor environments.",
            "Managed cloud resources and analyzed billings to optimize costs.",
            "Troubleshot connectivity, performance, and security issues to ensure uptime of network and servers.",
          ],
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
  title: "Projects",
  description:
    "My projects makes use of vast variety of latest technology tools. My best experience is to create Data Science projects and deploy them to web applications using cloud infrastructure.",
  avatar_image_path: "projects_image.svg",
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
    subtitle: "Bentonville, Arkansas, USA 72713",
    locality: "Bentonville",
    country: "USA",
    region: "Arkansas",
    postalCode: "72713",
    streetAddress: "Bentonville, Arkansas",
    avatar_image_path: "address_image.svg",
    location_map_link:
      "https://www.google.com/maps/place/Bentonville,+AR+72713",
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
  contactPageData,
};
