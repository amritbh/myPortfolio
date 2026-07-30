---
name: Blog Writing Patterns
description: Conventions for drafting, formatting, and planning technical blog posts for the portfolio, including markdown usage, image handling, and updating the blog content plan.
---

# Blog Writing Patterns

This project maintains a series of technical blog posts describing its own architecture and implementation. When asked to draft or update blog content, strictly adhere to the following patterns.

## 1. Storage & Naming Conventions

- Store all raw markdown drafts locally in the `docs/` directory.
- Follow the naming convention: `docs/blog{N}_content.md` (e.g., `docs/blog3_content.md`).
- **Git Tracking:** Note that individual blog content files (like `docs/blog1_content.md`, `docs/blog2_content.md`, etc.) are explicitly ignored in `.gitignore`. **Do not attempt to commit them** to the repository unless explicitly asked by the user to remove them from `.gitignore`.

## 2. Formatting & Structure

- **No Markdown Titles:** Do not include a top-level heading (e.g., `# Blog Title`) at the very beginning of the file. The file should start directly with the introductory paragraph, as titles are managed separately in the Admin UI/Database.
- **Images & Architecture Diagrams:**
  - The correct S3 media URL format is `https://amrit.cloud/media/{filename.png}` (do not use double `/media/media/`).
  - When drafting a new blog, proactively generate high-quality AI images for the **Blog Cover** and any **Architecture Diagrams** using the image generation tool. **CRITICAL**: For BOTH cover images and architecture diagrams, ALWAYS instruct the image generator to create a "minimalist, flat, and professional draw.io / Excalidraw-style diagram using standard AWS icons. Avoid all complex 3D rendering and glowing neon effects so it looks exactly like a natural, hand-crafted system design chart drawn up by an engineer."
  - Upload these generated images directly to the S3 bucket (`s3://amrit-portfolio-prod-media/media/`) using `aws s3 cp`.
  - **Important**: For architecture diagrams, always **retain the original ASCII text diagram** directly below the image tag in the markdown file. This ensures the raw technical flow is preserved alongside the visual diagram.
- **Syntax:** Use standard GitHub-flavored Markdown for code blocks (specifying the language, e.g., ```python) and blockquotes.

## 3. Blog Content Plan

- **Mandatory Updates:** Whenever a new blog topic is drafted, brainstormed, or shifted, you MUST update the `docs/blog-content-plan.md` file to reflect the new structure.
- Maintain the table format in the content plan for topics, read time, tags, and the expected publishing schedule.
- Unlike individual blog drafts, the `docs/blog-content-plan.md` file _is_ typically committed to the repository (if not ignored), so ensure it is tracked appropriately.

## 4. Content Guidelines

- **Keywords:** Always weave the terms "serverless portfolio", "technical blogging", and "dynamic blogging" into the narrative of the blog content to reinforce the overarching theme of this series.

## 5. Typography Rules (From AGENTS.md)

- Avoid using hyphens (`-`), double underscores (`__`), or em dashes (`—`) in sentences as punctuation AND completely avoid them in blog headings. These can cause rendering conflicts with the custom UI parser.
- Standard markdown lists using hyphens are completely fine. Use commas, parentheses, or rephrase sentences to avoid inline punctuation issues.
