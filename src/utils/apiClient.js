// We fetch from the custom API deployed via API Gateway
const API_URL =
  typeof process !== "undefined" && process.env
    ? process.env.REACT_APP_CUSTOM_API_URL
    : null;

// Mock data in case the API isn't deployed yet or for local dev without DB
const mockBlogs = [
  {
    slug: "migrating-to-terraform",
    title: "Migrating My Portfolio to Terraform & Terragrunt",
    summary:
      "How I converted my manually deployed AWS infrastructure to IaC using Terraform and Terragrunt.",
    publishDate: "2026-07-04T12:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    author: {
      name: "Amrit",
      avatar: "https://avatars.githubusercontent.com/u/79965355?v=4",
    },
    tags: ["AWS", "Terraform", "DevOps"],
    readTime: "6 min read",
    content:
      "# Infrastructure as Code\n\nTerraform is an amazing tool. I recently converted my portfolio from a manual deployment to a fully automated IaC pipeline.\n\n## Why Terragrunt?\nTerragrunt allowed me to keep my Terraform code DRY (Don't Repeat Yourself). Instead of repeating backend configuration, it abstracts it perfectly.",
  },
  {
    slug: "building-python-serverless-backend",
    title: "Building a Serverless Python Backend on AWS",
    summary:
      "Ditching a Headless CMS in favor of a fully custom Serverless backend using AWS DynamoDB, Lambda, and API Gateway.",
    publishDate: "2026-07-03T12:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    author: {
      name: "Amrit",
      avatar: "https://avatars.githubusercontent.com/u/79965355?v=4",
    },
    tags: ["Python", "Serverless", "DynamoDB"],
    readTime: "8 min read",
    content:
      "# Serverless Backend\n\nWhy use Contentful when you can build it yourself? Using **Boto3** and **DynamoDB**, I built a blazingly fast API.\n\n## Architecture\n1. **API Gateway**: Provides the HTTP endpoints.\n2. **Lambda**: Runs my Python code.\n3. **DynamoDB**: Stores the NoSQL data.",
  },
  {
    slug: "modern-react-glassmorphism",
    title: "Designing a Premium React UI with Glassmorphism",
    summary:
      "A deep dive into building ultra-modern, responsive React interfaces featuring glassmorphism and subtle micro-animations.",
    publishDate: "2026-06-25T12:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    author: {
      name: "Amrit",
      avatar: "https://avatars.githubusercontent.com/u/79965355?v=4",
    },
    tags: ["React", "UI/UX", "CSS"],
    readTime: "5 min read",
    content:
      "# Premium Web Design\n\nWeb design is evolving. The modern web requires more than just functional components; it demands *experiences*.\n\n## Glassmorphism\nUsing `backdrop-filter: blur(10px)` allows us to create beautiful frosted glass effects that elevate the entire interface.",
  },
];

export const fetchBlogs = async () => {
  if (API_URL) {
    try {
      const response = await fetch(`${API_URL}/blogs`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching blogs from API:", error);
      return [];
    }
  } else {
    console.warn("API URL not configured in .env, returning mock data.");
    return mockBlogs;
  }
};

export const fetchBlogBySlug = async (slug) => {
  if (API_URL) {
    try {
      const response = await fetch(`${API_URL}/blogs/${slug}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching blog from API:", error);
      return null;
    }
  } else {
    console.warn("API URL not configured in .env, returning mock data.");
    return mockBlogs.find((blog) => blog.slug === slug);
  }
};

export const createBlog = async (blogData, password) => {
  if (!API_URL) {
    console.error("API URL not configured, cannot create blog.");
    return { success: false, error: "API URL not configured" };
  }

  try {
    const response = await fetch(`${API_URL}/blogs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${password}`,
      },
      body: JSON.stringify(blogData),
    });

    if (response.status === 401) {
      return { success: false, error: "Invalid Admin Password" };
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error creating blog:", error);
    return { success: false, error: error.message };
  }
};
