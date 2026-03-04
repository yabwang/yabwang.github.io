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

## Git

Main branch: `main`

Commit format for algorithm posts:
```
feat: 添加 Day {NN}算法刷题 - {Topic}
```
