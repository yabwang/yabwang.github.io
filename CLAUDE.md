# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A tech blog built with VitePress covering:
- 30-day algorithm challenge (LeetCode solutions in Java)
- Java interview preparation
- AI/LLM technical articles
- Miscellaneous technical essays

## Commands

```bash
# Development server
npm run docs:dev

# Build production site
npm run docs:build

# Preview production build
npm run preview

# Generate statistics
npm run stats

# Update latest articles
npm run update-latest
```

## Architecture

**Content Structure:**
- `docs/30-day-algorithm/` - Algorithm challenge articles (day01.md - day30.md format)
- `docs/java-learning/` - Java interview preparation materials
- `docs/ai/` - AI/LLM technical articles
- `docs/others/` - Miscellaneous technical articles
- `docs/.vitepress/config.ts` - VitePress configuration with sidebar generation

**Key Scripts:**
- `scripts/generate-stats.js` - Generates site statistics
- `scripts/update-latest-articles.js` - Updates latest articles index
- `scripts/push.js` - Deployment script

## Blog Workflow

Always use the correct blog post directory structure: `docs/<category>/<filename>.md` with corresponding sidebar config update in `docs/.vitepress/config.ts`.

When creating new blog posts:
1. Place file in correct category directory (ai/, java-learning/, others/, etc.)
2. Add proper frontmatter with `order` field for sidebar ordering
3. Update sidebar configuration in `docs/.vitepress/config.ts`
4. Verify the file appears correctly in the sidebar navigation

## Algorithm Challenge Format

Files in `docs/30-day-algorithm/` follow a strict template:
- Frontmatter: `order: {day_number}`
- Title: `# Day {NN} - {Topic}`
- Two LeetCode problems per day with solutions in Java
- Structure: Problem → Solution Approach → Code → Complexity Analysis
- Summary section with key learnings and next-day preview

After creating a new day file, update `docs/30-day-algorithm/index.md` to change status from `⏳` to `✅` and add problem titles.

## Cursor Rules

This project has `.cursorrules` defining:
- Algorithm file naming: `day{NN}.md` (e.g., `day04.md`)
- Java code style: camelCase variables, 4-space indentation
- LeetCode links use Chinese site: `leetcode.cn`
- All solutions must be complete, runnable Java code

## Repository Reference

GitHub repository URLs: Primary repos include wangjs-jacky organization. Store and reference saved repo URLs for future operations.

Key repositories:
- Personal: https://github.com/yabwang
- Blog: https://github.com/yabwang/yabwang.github.io
- Skills: https://github.com/yabwang/claude-skills
- Organization repos: wangjs-jacky organization projects

## Deployment Checklist

Check all internal links before deployment. Use `ignoreDeadLinks: true` in VitePress config only as temporary fix, not permanent solution.

Pre-deployment checks:
1. Verify all internal links are valid (no localhost URLs)
2. Ensure sidebar configuration is updated for new posts
3. Run `npm run docs:build` to test build locally
4. Check that all frontmatter is properly formatted
5. Confirm all referenced images/assets exist

## Git Workflow

For git operations, skip confirmation prompts by default - use `git add -A && git commit -m "message" && git push` workflow unless working on sensitive files.

Main branch: `main`

Commit format for algorithm posts:
```
feat: 添加 Day {NN}算法刷题 - {Topic}
```

Commit format for blog posts:
```
feat: 添加 [Topic] 博客文章
```

## Development Guidelines

When creating new files, verify the target directory exists and matches the project's established structure before writing. Check worktree vs main repo location.

Best practices:
- Read existing files in the same directory first to understand the structure
- Verify directory path before writing new content
- Use consistent naming conventions with existing files
- Check if working in a worktree or main repository
