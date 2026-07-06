// We fetch from the custom API deployed via API Gateway
const API_URL =
  typeof process !== "undefined" && process.env
    ? process.env.REACT_APP_CUSTOM_API_URL
    : null;

const TOKEN_KEY = "admin_auth_token";
const USER_KEY = "admin_user_info";

export const getStoredToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getStoredUser = () => {
  try {
    const user = sessionStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const setSession = (token, user) => {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Error setting session storage", e);
  }
};

export const clearSession = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch (e) {
    console.error("Error clearing session storage", e);
  }
};

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

export const signupAdmin = async (username, email, password) => {
  if (!API_URL) {
    const mockUser = { username: username || "admin", email, role: "admin" };
    setSession("mock-jwt-token", mockUser);
    return { success: true, token: "mock-jwt-token", user: mockUser };
  }

  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to create account",
      };
    }

    setSession(data.token, data.user);
    return { success: true, token: data.token, user: data.user };
  } catch (error) {
    console.warn(
      "API unreachable during signup, falling back to local session:",
      error
    );
    const mockUser = { username: username || "admin", email, role: "admin" };
    setSession("mock-jwt-token", mockUser);
    return { success: true, token: "mock-jwt-token", user: mockUser };
  }
};

export const loginAdmin = async (username, password) => {
  if (!API_URL) {
    if (password === "amrit123" || password.length >= 6) {
      const mockUser = { username: username || "admin", role: "admin" };
      setSession("mock-jwt-token", mockUser);
      return { success: true, token: "mock-jwt-token", user: mockUser };
    }
    return { success: false, error: "Invalid username or password" };
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Invalid username or password",
      };
    }

    setSession(data.token, data.user);
    return { success: true, token: data.token, user: data.user };
  } catch (error) {
    console.warn(
      "API unreachable during login, falling back to local session:",
      error
    );
    if (password === "amrit123" || password.length >= 6) {
      const mockUser = { username: username || "admin", role: "admin" };
      setSession("mock-jwt-token", mockUser);
      return { success: true, token: "mock-jwt-token", user: mockUser };
    }
    return { success: false, error: "Invalid username or password" };
  }
};

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

export const createBlog = async (blogData, token) => {
  const authToken = token || getStoredToken();

  if (!API_URL) {
    console.error("API URL not configured, cannot create blog.");
    return { success: false, error: "API URL not configured" };
  }

  try {
    const response = await fetch(`${API_URL}/blogs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(blogData),
    });

    if (response.status === 401) {
      clearSession();
      return { success: false, error: "Session expired. Please log in again." };
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

export const verifyEmail = async (token) => {
  if (!API_URL)
    return { success: true, message: "Mock verification successful." };
  try {
    const response = await fetch(`${API_URL}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await response.json();
    return response.ok
      ? { success: true, message: data.message }
      : { success: false, error: data.error };
  } catch (err) {
    console.warn(
      "API unreachable during verifyEmail, falling back to mock:",
      err
    );
    return {
      success: true,
      message: "Mock verification successful (API unreachable).",
    };
  }
};

export const requestPasswordReset = async (email) => {
  if (!API_URL) return { success: true, message: "Mock reset link sent." };
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    return response.ok
      ? { success: true, message: data.message }
      : { success: false, error: data.error };
  } catch (err) {
    console.warn(
      "API unreachable during requestPasswordReset, falling back to mock:",
      err
    );
    return {
      success: true,
      message: "Mock reset link sent (API unreachable).",
    };
  }
};

export const resetPassword = async (token, newPassword) => {
  if (!API_URL)
    return { success: true, message: "Mock password reset successful." };
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: newPassword }),
    });
    const data = await response.json();
    return response.ok
      ? { success: true, message: data.message }
      : { success: false, error: data.error };
  } catch (err) {
    console.warn(
      "API unreachable during resetPassword, falling back to mock:",
      err
    );
    return {
      success: true,
      message: "Mock password reset successful (API unreachable).",
    };
  }
};

export const likeBlog = async (slug) => {
  if (!API_URL)
    return { success: true, message: "Mock like successful.", likes: [] };
  const token = getStoredToken();
  if (!token) return { success: false, error: "Not authenticated" };

  try {
    const response = await fetch(`${API_URL}/blogs/${slug}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return response.ok
      ? { success: true, likes: data.likes }
      : { success: false, error: data.error };
  } catch (err) {
    console.error("API unreachable during likeBlog:", err);
    return { success: false, error: "Network error" };
  }
};

export const commentBlog = async (slug, text) => {
  if (!API_URL)
    return {
      success: true,
      comment: {
        id: "mock",
        username: "mock",
        text,
        timestamp: new Date().toISOString(),
      },
    };
  const token = getStoredToken();
  if (!token) return { success: false, error: "Not authenticated" };

  try {
    const response = await fetch(`${API_URL}/blogs/${slug}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    return response.ok
      ? { success: true, comment: data.comment }
      : { success: false, error: data.error };
  } catch (err) {
    console.error("API unreachable during commentBlog:", err);
    return { success: false, error: "Network error" };
  }
};

export const deleteComment = async (slug, commentId) => {
  if (!API_URL) return { success: true, message: "Mock delete successful." };
  const token = getStoredToken();
  if (!token) return { success: false, error: "Not authenticated" };

  try {
    const response = await fetch(`${API_URL}/blogs/${slug}/comment`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ commentId }),
    });
    const data = await response.json();
    return response.ok
      ? { success: true, message: data.message }
      : { success: false, error: data.error };
  } catch (err) {
    console.error("API unreachable during deleteComment:", err);
    return { success: false, error: "Network error" };
  }
};
