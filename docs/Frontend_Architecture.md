# Frontend Architecture & Design Documentation

## 1. The Premium Blog Redesign

The blog section was completely redesigned to replicate the aesthetic of a modern, premium Headless CMS (like Contentful or Hygraph).

### CSS Strategy

Instead of relying heavily on a CSS framework, the components use raw CSS with modern design practices:

- **Glassmorphism**: Achieved using `backdrop-filter: blur()` to create elegant frosted-glass overlays (specifically on the blog tags).
- **Masonry Grid**: A responsive `CSS Grid` is used in `BlogList` to beautifully organize the blog cards across devices.
- **Micro-Animations**: Extensive use of `transform` and `transition` for hover effects on `BlogCard` to create a tactile, dynamic feel.
- **Typography Integration**: The markdown parsing was styled to match Medium/Hashnode, prioritizing line height, responsive font sizing, and clean blockquotes/code blocks.

### Component Structure

- `BlogList`: The main layout container. Hosts the hero banner and maps the `blogs` into the grid.
- `BlogCard`: The grid item component. It is highly optimized to truncate text gracefully (using `-webkit-line-clamp`) and handle image loading.
- `BlogDetail`: The individual post view. Renders the dynamic `hero` section based on the fetched data, and uses `marked` to safely parse Markdown into HTML.

---

## 2. API Integration (Moving Away from Contentful)

The application previously relied on the Contentful SDK for blog content. This architecture was modernized to use a fully custom Python Serverless Backend deployed via AWS.

### Changes Made:

1. **Removed `contentfulClient.js`**: The legacy SDK and credentials handling were deleted.
2. **Standardized `apiClient.js`**: A centralized client is used to fetch both `fetchBlogs()` and `fetchBlogBySlug()`.
3. **Mock Fallback**: If the `REACT_APP_CUSTOM_API_URL` is missing, `apiClient` falls back to rich local mock data, ensuring the frontend is totally unblocked for developers.

### Expected Backend Schema

The React components now expect the backend to return JSON items in the following structure:

```json
{
  "slug": "unique-slug-string",
  "title": "Post Title",
  "summary": "Short description...",
  "content": "# Full markdown body",
  "publishDate": "2026-07-04T12:00:00Z",
  "readTime": "5 min read",
  "tags": ["Tag1", "Tag2"],
  "coverImage": "https://url-to-s3-image.jpg",
  "author": {
    "name": "Amrit",
    "avatar": "https://url-to-github-avatar.jpg"
  }
}
```

---

## 3. Custom Admin CMS (Serverless Dashboard)

To replace the authoring capabilities of Contentful, a bespoke `/admin` Dashboard was built directly into the React application, interfacing with the Python backend.

### Frontend Implementation (`AdminDashboard.js`)

- **Authentication**: A simple password wall protects the CMS.
- **Split-Pane Editor**: The UI features a split view with a raw text area for Markdown input on the left and a live HTML preview (parsed by `marked`) on the right.
- **Auto-Slug**: The frontend automatically generates URL-friendly slugs based on the typed title.
- **Payload Construction**: The React state formats all metadata and content into the expected JSON schema and dispatches it via `apiClient.createBlog()`.

### Backend Implementation (`app.py` & DynamoDB)

- **POST Route**: The API Gateway was updated via Terraform to route `POST /blogs` to the `create_blog()` handler.
- **Security Check**: The Lambda function validates the incoming `Authorization` header against the `ADMIN_PASSWORD` injected by Terraform.
- **Direct Insertion**: Once authorized and validated, the Lambda uses `boto3` to inject the JSON item directly into DynamoDB, instantly making the post live on the frontend grid.
