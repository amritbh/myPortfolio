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
  - The correct S3 media URL format is `https://amrit.cloud/media/blogs/<blog-slug>/{filename.png}`. Do not store images in the root `/media/` folder.
  - **IMPORTANT**: Never include the cover image markdown (e.g. `![Cover](...)`) at the top of the blog content body. The frontend CMS automatically renders the `coverImage` attribute from DynamoDB at the top of the page. Including it in the markdown will cause the image to display twice.
  - When drafting a new blog, proactively generate high-quality AI images for the **Blog Cover** and any **Architecture Diagrams** using the image generation tool. **CRITICAL**: For BOTH cover images and architecture diagrams, ALWAYS instruct the image generator to create a "minimalist, flat, and professional draw.io / Excalidraw-style diagram using highly colorful, recognizable AWS icons (e.g. blue for DynamoDB, orange for Lambda). Avoid all complex 3D rendering and glowing neon effects so it looks exactly like a natural, hand-crafted system design chart drawn up by an engineer." Additionally, instruct the generator to embed the diagram's title EXACTLY ONCE at the top center of the image.
  - Upload these generated images directly to the entity-based directory in the S3 bucket (`s3://amrit-portfolio-prod-media/media/blogs/<blog-slug>/`) using `aws s3 cp`.
  - **Important**: For architecture diagrams, always **retain the original ASCII text diagram** directly below the image tag in the markdown file. This ensures the raw technical flow is preserved alongside the visual diagram.
- **Syntax:** Use standard GitHub-flavored Markdown for code blocks (specifying the language, e.g., ```python) and blockquotes.
- **No Horizontal Rules:** Do not use markdown horizontal dividers (`---`) between sections or anywhere in the body of the blog post, as they cause excessive visual gaps in the custom rendering UI. Use simple heading spacing instead.
- **Navigation Links:** At the bottom of each blog draft, always include "**Read Previous:** [Title](/blogs/slug)" and "**Read Next:** [Title](/blogs/slug)" links (where applicable) to connect the posts logically in the series.

## 3. Blog Content Plan

- **Mandatory Updates:** Whenever a new blog topic is drafted, brainstormed, or shifted, you MUST update the `docs/blog-content-plan.local.md` file to reflect the new structure.
- Maintain the table format in the content plan for topics, read time, tags, and the expected publishing schedule.
- Ensure the `docs/blog-content-plan.local.md` file is kept strictly local and NEVER committed to the repository. It should be explicitly ignored in `.gitignore`.
- **Technical vs. Travel Story Separation:** There is a strict separation between technical architecture blogs (e.g., Phase 9) and actual travel/trek stories (e.g., Phase 10). Technical blogs discuss code and infrastructure, while travel stories document personal trip experiences. **CRITICAL:** Before drafting, naming, or overwriting any blog file (e.g., `blog34_content.local.md`), you MUST review `docs/blog-content-plan.local.md` to ensure you are writing the correct topic for that sequence number, so you do not mistakenly overwrite a travel story with a technical post (or vice versa).

## 4. Content Guidelines

- **Writing Tone:** The writing style should be natural and humanized, sounding like a real engineer sharing their experiences, not like a stiff corporate manual or an AI assistant.
- **Keywords:** Always weave the terms "serverless portfolio", "technical blog", and "travel blog" into the narrative of the blog content to reinforce the overarching theme of this series.
- **Title Numbering:** When publishing or registering a new blog post in DynamoDB, ensure the title is prepended with its sequential number (e.g., "6. Title Goes Here").

## 5. Typography Rules (From AGENTS.md)

- **NEVER** use em dashes (`—`), hyphens (`-`), or double underscores (`__`) in the **title** or anywhere in the **content/body** of the blog post as punctuation. These characters cause severe rendering conflicts with the custom UI parser.
- Standard markdown lists using hyphens are completely fine. Use commas, parentheses, or rephrase sentences to avoid inline punctuation issues.

## 6. Publishing the Blog

- When explicitly asked to publish a blog, you can bypass the Admin UI by writing a Python script to directly insert the blog JSON into the DynamoDB `amrit-portfolio-prod-blogs` table in `us-east-1` using `boto3`.
- **CRITICAL WARNING**: The frontend React app can fail to render blogs if the sorting logic encounters invalid data. You MUST ensure:
  1. The date field is exactly named `publishDate` (do NOT use `date`).
  2. The `title` field is prepended with its sequential number (e.g., "27. Your Title").
  3. The `summary` field is included.
  4. The `coverImage` URL strictly uses the CloudFront domain `https://amrit.cloud/...` and NEVER the raw S3 bucket URL (`s3.amazonaws.com`), which will return a 403 Forbidden.
- The item schema must exactly match the required DynamoDB structure.
- Example script structure:

  ```python
  import boto3
  import datetime

  dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
  table = dynamodb.Table('amrit-portfolio-prod-blogs')

  with open('docs/blogX_content.local.md', 'r') as f:
      content = f.read()

  item = {
      'slug': 'your-slug-here',
      'title': 'X. Your Title Here',
      'summary': 'Your summary here',
      'publishDate': datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
      'coverImage': 'https://amrit.cloud/media/blogs/your-slug-here/cover.png',
      'readTime': 'X min read',
      'tags': ['Tag1', 'Tag2'],
      'author': {
          'name': 'Amrit',
          'avatar': 'https://avatars.githubusercontent.com/u/79965355?v=4'
      },
      'likes': [],
      'views': [],
      'comments': [],
      'content': content
  }
  table.put_item(Item=item)
  ```

- Run the script using the `run_command` tool to publish, then clean up and delete the temporary script. Finally, mark the blog as `(Published)` in the `docs/blog-content-plan.local.md` file.

## 7. Out-of-Plan (Ad-Hoc) Blog Posts

Sometimes a blog post arises from a real production incident, a security fix, or a sprint that was not originally planned in the content plan (e.g., Blog 35 "Stopping Contact Form Spam" came from a live spam attack, not from any scheduled phase).

Follow this exact protocol when asked to write and publish a blog that does not map to an existing planned entry:

**Step 1: Determine the next sequential number.**
Check `docs/blog-content-plan.local.md` to find the highest published blog number. The new blog gets the next available number, regardless of which planned phase it belongs to. Do NOT skip numbers or leave gaps.

**Step 2: Write and publish the blog using that number.**
Use the standard publishing workflow in Section 6. The `title` field in DynamoDB must be prepended with this number (e.g., `"35. Stopping Contact Form Spam..."`). The local draft file should be named `docs/blog{N}_content.local.md`.

**Step 3: NEVER replace an existing planned entry in the content plan.**
The planned entries in `docs/blog-content-plan.local.md` represent future work. An ad-hoc blog must NEVER overwrite a planned entry. Instead:

- Add the new blog to a new or existing thematic phase section (e.g., "Phase 11 — Security Engineering") at the bottom of the content plan.
- Reference it with its real published number (e.g., `### Blog 35: "..."`).

**Step 4: Renumber all conflicting planned future entries.**
If the ad-hoc blog's number conflicts with a planned future blog (e.g., you published as 35 but Blog 35 was already a planned travel post), you MUST shift all affected future planned blog numbers up by 1 to restore a conflict-free sequence:

- Change old Blog 35 → Blog 36, old Blog 36 → Blog 37, and so on for every entry that follows.
- Update the Phase headers (e.g., "Phase 10 — Travel Stories (Blogs 37–42)" becomes "Blogs 38–43").
- Update the publishing schedule table in the content plan to match.

**Step 5: Update the sprint tracker.**
Add a task entry (e.g., `9.14`) under the relevant sprint in `docs/sprint-tracker.local.md` to record the blog publication.

**Example (what happened with Blog 35):**

- A spam attack hit the contact form in production. An ad-hoc security blog was written and published as Blog 35.
- The planned Blog 35 "Building Destination Detail Pages" was shifted to Blog 36.
- Blogs 36–42 in the travel series all shifted up by 1 (becoming 37–43).
- The spam blog was logged under a new "Phase 11 — Security Engineering" section in the content plan with its correct published number (35), not a new fabricated number (43).
