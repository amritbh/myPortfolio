// We fetch from the custom API deployed via API Gateway
const API_URL =
  typeof process !== "undefined" && process.env
    ? process.env.REACT_APP_CUSTOM_API_URL
    : null;

// Mock data in case the API isn't deployed yet
const mockBlogs = [
  {
    slug: "migrating-to-terraform",
    title: "Migrating My Portfolio to Terraform & Terragrunt",
    summary:
      "How I converted my manually deployed AWS infrastructure to IaC using Terraform and Terragrunt.",
    publishDate: "2026-07-04T12:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    content:
      "# Infrastructure as Code\n\nTerraform is an amazing tool. I recently converted my portfolio from a manual deployment to a fully automated IaC pipeline...",
  },
  {
    slug: "building-python-serverless-backend",
    title: "Building a Serverless Python Backend on AWS",
    summary:
      "Ditching a Headless CMS in favor of a fully custom Serverless backend using AWS DynamoDB, Lambda, and API Gateway.",
    publishDate: "2026-07-03T12:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    content:
      "# Serverless Backend\n\nWhy use Contentful when you can build it yourself? Using Boto3 and DynamoDB, I built a blazingly fast API.",
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
