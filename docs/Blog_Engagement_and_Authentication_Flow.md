# Blog Engagement and Unified Authentication Flow

## Overview

This document outlines the architecture and implementation details for the Blog Engagement feature (Likes & Comments) and the Unified Authentication Flow for the portfolio application.

## 1. Unified Authentication Flow

### Previous State

Previously, authentication was managed exclusively via the `AdminDashboard.js` component. There was no distinct login page for normal users, and the CMS tooling was bundled with the login logic.

### New Architecture

- **Dedicated Login Page (`/login`)**: All authentication logic is now encapsulated in `Login.js`. This creates a cleaner separation of concerns and a better user experience for normal visitors.
- **Role-Based Redirection**:
  - `Login.js` determines the user's role upon successful authentication.
  - Users with `role: 'admin'` are automatically redirected to the CMS (`/admin`).
  - Users with `role: 'user'` are redirected to the homepage (`/home`).
- **CMS Protection**: `AdminDashboard.js` has been simplified to only render the markdown authoring tools. If an unauthenticated user or a non-admin attempts to access `/admin`, the application securely redirects them to `/login`.

## 2. Blog Engagement (Likes and Comments)

To foster interaction, the blog section now supports liking posts and adding comments.

### Backend Implementation (`app.py` & API Gateway)

- **New API Gateway Routes**:
  - `POST /blogs/{slug}/like`: Toggles a user's like on a specific blog post.
  - `POST /blogs/{slug}/comment`: Adds a new comment to a blog post.
  - `DELETE /blogs/{slug}/comment`: Deletes a specific comment from a blog post.
- **DynamoDB Schema**:
  - **Likes**: Stored as an array of usernames (`likes`). The `like_blog` handler toggles the username's presence in this array, ensuring a user can only like a post once.
  - **Comments**: Stored as an array of objects (`comments`). Each object contains an `id` (UUID), `username`, `text`, and `timestamp`.
- **Authorization & Security**:
  - **Like/Comment**: Any authenticated user (`user` or `admin`) can like a post or leave a comment.
  - **Deletion**:
    - The author of a comment is allowed to delete their own comment.
    - Admins (`role: 'admin'`) have elevated privileges and can delete _any_ comment for moderation purposes.

### Frontend Implementation (`BlogDetail.js` & `apiClient.js`)

- **Engagement UI**: Integrated a responsive engagement section at the bottom of the `BlogDetail.js` view.
- **State Management**:
  - The UI dynamically checks `localStorage` (via `getStoredUser()`) to see if a session exists.
  - If no session exists, the UI prompts the visitor to log in.
  - If authenticated, the interactive "Like" button and the "Add Comment" form are rendered.
- **Real-Time Updates**:
  - Upon liking or commenting, the frontend sends the request via `apiClient.js` and updates the local state to immediately reflect the change without requiring a page reload.
  - The "Delete" button (an "✕") is conditionally rendered next to comments if the logged-in user is the comment's author or holds an admin role.

## 3. Automated Testing

- **Unit Tests (`test_app.py`)**: Thorough test coverage was added for `like_blog`, `comment_blog`, and `delete_comment`. Tests verify constraints, such as ensuring a non-admin cannot delete another user's comment, and ensuring users can only like once. All 21 Python backend tests pass cleanly.
- **Infrastructure Validation**: Terraform configuration changes (`api_gateway.tf`) were tested and successfully applied to the production environment.
