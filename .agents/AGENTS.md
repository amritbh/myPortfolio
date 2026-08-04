# Blog Writing Guidelines

- When writing or editing blog posts, avoid using hyphens (`-`) or double underscores (`__`) in sentences as punctuation (e.g., as em dashes) because they can cause rendering issues or formatting conflicts in the UI. Instead, use commas, parentheses, or format the sentence to avoid them entirely. Note that hyphens used in standard markdown lists are fine, but avoid them as inline punctuation within sentences.

- **Blog Content Plan**: Whenever writing a new blog post, completing a blog, or changing blog strategies, remember to update the `docs/blog-content-plan.md` file to keep the progress and upcoming topics in sync.

# Code Quality & Testing Rules

- **Test Coverage Requirement**: Any new code or modifications to existing code MUST be accompanied by comprehensive test cases.
- **Verify Before Push**: Before pushing any changes, you must explicitly run tests to verify that the code passes and that test coverage remains above 80% (SonarQube requirement).
  - For frontend (React): Use `npm test -- --coverage` to verify the coverage of the modified components and hooks.
  - For backend (Python/Lambda): Use `pytest --cov=.` to verify the coverage of the modified logic.
- **Failures blocking Push**: Do not attempt to push changes if tests are failing or if coverage for the modified logic is insufficient. Iterate on adding test cases first.

# Git & GitHub Workflow Rules

- **Branch Management**: Before making ANY new commit or starting ANY new task, ALWAYS check if the current branch's PR has already been merged (using `gh pr status` or `gh pr view`). If the remote branch is merged:
  1. DO NOT make any further commits to the current branch.
  2. You MUST run `git checkout main` and `git pull` to get the latest merged changes.
  3. Create a brand new branch for the new work.
- **Draft PRs**: Whenever you are asked to create a Pull Request (PR), ALWAYS create a **Draft PR** (e.g., using `gh pr create --draft`).
- **Protect Main Branch**: NEVER push changes directly to the `main` branch. All work must be pushed to feature branches and merged via Pull Requests.
