---
name: API Client Patterns
description: Frontend API client conventions including mock fallback pattern, authenticated fetch wrapper, session management, and test requirements for new endpoints. Use this skill when adding new API calls, modifying auth flows, or updating the data layer.
---

# API Client Patterns

All frontend API calls live in `src/utils/apiClient.js`. This is the single data access layer between the React frontend and the AWS backend.

## Key File: `src/utils/apiClient.js`

### API URL Configuration

```js
const API_URL =
  typeof process !== "undefined" && process.env
    ? process.env.REACT_APP_CUSTOM_API_URL
    : null;
```

When `API_URL` is `null` (local dev without `.env`), ALL functions fall back to mock data.

## Core Patterns

### Pattern 1: Public Endpoint with Mock Fallback

```js
export const fetchBlogs = async () => {
  if (API_URL) {
    try {
      const response = await fetch(`${API_URL}/blogs`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching blogs from API:", error);
      return []; // Return empty/safe default on error
    }
  } else {
    console.warn("API URL not configured in .env, returning mock data.");
    return mockBlogs; // Return mock data when API not configured
  }
};
```

**Rules:**

- Check `if (API_URL)` first
- Wrap fetch in try/catch
- Return safe defaults on error (empty array, null, etc.)
- When no API_URL, return mock data with `console.warn`

### Pattern 2: Authenticated Endpoint (Admin Operations)

```js
const authFetch = async (endpoint, method, token, body = null) => {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(`${API_URL}${endpoint}`, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `Error: ${response.status}`,
      };
    }
    return { success: true, data: await response.json() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

Functions using `authFetch`:

```js
export const createBlog = (blogData, token) =>
  authFetch("/blogs", "POST", token, blogData);
export const updateBlog = (slug, blogData, token) =>
  authFetch(`/blogs/${slug}`, "PUT", token, blogData);
export const deleteBlog = (slug, token) =>
  authFetch(`/blogs/${slug}`, "DELETE", token);
```

### Pattern 3: User-Authenticated Endpoint (Social Features)

For features where any logged-in user can participate:

```js
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
    return { success: false, error: "Network error" };
  }
};
```

**Key difference from admin pattern:** Token comes from `getStoredToken()` (current session), not passed as parameter.

### Pattern 4: Auth Endpoints with Graceful Fallback

```js
export const loginAdmin = async (username, password) => {
  if (!API_URL) {
    // Mock login: accept reasonable passwords
    if (password === "amrit123" || password.length >= 6) {
      const mockUser = { username: username || "admin", role: "admin" };
      setSession("mock-jwt-token", mockUser);
      return { success: true, token: "mock-jwt-token", user: mockUser };
    }
    return { success: false, error: "Invalid username or password" };
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, { ... });
    // ... handle response
  } catch (error) {
    // API unreachable: fall back to mock login
    console.warn("API unreachable during login, falling back to local session:", error);
    if (password.length >= 6) { /* mock success */ }
    return { success: false, error: "Invalid username or password" };
  }
};
```

**Critical:** Auth endpoints have a DOUBLE fallback — both when API_URL is null AND when the API is unreachable (catch block).

## Session Management

```js
const TOKEN_KEY = "admin_auth_token";
const USER_KEY = "admin_user_info";

export const getStoredToken = () => sessionStorage.getItem(TOKEN_KEY);
export const getStoredUser = () => JSON.parse(sessionStorage.getItem(USER_KEY));
export const setSession = (token, user) => {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
};
export const clearSession = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};
```

**Uses `sessionStorage`** (not `localStorage`) — session is cleared when the tab closes.

## Return Value Conventions

| Function Type  | Success Return                     | Error Return                |
| -------------- | ---------------------------------- | --------------------------- |
| Fetch (list)   | `Array`                            | `[]`                        |
| Fetch (single) | `Object`                           | `null`                      |
| Auth           | `{ success: true, token, user }`   | `{ success: false, error }` |
| CRUD           | `{ success: true, data }`          | `{ success: false, error }` |
| Social         | `{ success: true, likes/comment }` | `{ success: false, error }` |

## Complete Function List

### Public (no auth)

- `fetchBlogs()` → `GET /blogs`
- `fetchBlogBySlug(slug)` → `GET /blogs/{slug}`
- `fetchMediumBlogs()` → External RSS2JSON API (Medium feed)

### Auth Management

- `loginAdmin(username, password)` → `POST /auth/login`
- `signupAdmin(username, email, password)` → `POST /auth/signup`
- `verifyEmail(token)` → `POST /auth/verify-email`
- `requestPasswordReset(email)` → `POST /auth/forgot-password`
- `resetPassword(token, newPassword)` → `POST /auth/reset-password`

### Admin CRUD (token passed as parameter)

- `createBlog(blogData, token)` → `POST /blogs`
- `updateBlog(slug, blogData, token)` → `PUT /blogs/{slug}`
- `deleteBlog(slug, token)` → `DELETE /blogs/{slug}`

### User Social (token from session)

- `likeBlog(slug)` → `POST /blogs/{slug}/like`
- `commentBlog(slug, text)` → `POST /blogs/{slug}/comment`
- `deleteComment(slug, commentId)` → `DELETE /blogs/{slug}/comment`

### Session Helpers

- `getStoredToken()`, `getStoredUser()`, `setSession()`, `clearSession()`

## External API: Medium Blogs

```js
export const fetchMediumBlogs = async () => {
  const rssUrl = "https://medium.com/feed/@amrit.bhattarai990";
  const res = await fetch(
    `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`
  );
  // Transforms RSS items into blog card format
};
```

Returns blogs with `isExternal: true` and `externalLink` field.

## Mock Data

When API_URL is null, `fetchBlogs` returns `mockBlogs` — an array of 3 hardcoded blog objects at the top of the file. These use `require("../assests/images/amrit-pp.jpg")` for author avatars.

## Testing

Tests are in `src/utils/apiClient.test.js`. Every new function needs:

1. Test with API_URL set (mocked fetch)
2. Test with API_URL unset (mock fallback)
3. Test with API unreachable (fetch throws)
4. Test with non-OK response (4xx/5xx)

## Checklist: Adding a New API Function

1. Add function to `apiClient.js` following the appropriate pattern above
2. Include mock fallback when `!API_URL`
3. Include try/catch with `console.error` or `console.warn`
4. Return values must follow the conventions table
5. If authenticated, use `getStoredToken()` for user endpoints or accept `token` param for admin endpoints
6. Add corresponding tests in `apiClient.test.js`
7. Add the backend route handler in `app.py` (see `aws-backend` skill)
