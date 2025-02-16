# RSec Terminal Blog - Maintenance Guide

## Overview
This document provides detailed instructions for maintaining and updating the RSec Terminal Blog. This guide is intended for administrators only.

## Directory Structure
```
src/
├── components/         # React components
├── posts/             # Markdown blog posts
│   ├── ctf/          # CTF writeups
│   ├── tools/        # Tool reviews
│   ├── tutorials/    # Tutorials
│   ├── research/     # Research papers
│   ├── news/         # News articles
│   └── projects/     # Project posts
└── data/             # Configuration files
    └── directories.ts # Directory settings
```

## Creating Posts

### Post Format
1. Create a new markdown file in the appropriate directory under `src/posts/[directory]/`:
```markdown
---
title: Your Post Title
date: YYYY-MM-DD
author: Your Name
tags: [tag1, tag2]
---

# Your Post Title

Content goes here...
```

### Markdown Guidelines
- Use standard markdown syntax
- Code blocks with syntax highlighting:
  ````markdown
  ```javascript
  console.log('Hello, World!');
  ```
  ````
- Images:
  - Host images on a CDN or image hosting service
  - Use HTTPS URLs
  - Format: `![alt text](https://image-url.com/image.jpg)`

### File Naming
- Use kebab-case for filenames
- Include relevant category prefix
- Example: `hack-the-box-writeup.md`

## Adding New Directories

1. Edit `src/data/directories.ts`:
```typescript
export const directories: Directory[] = [
  {
    name: 'New Directory',
    path: 'unique-path',
    image: 'https://image-url.com/image.jpg',
    description: 'Directory description'
  },
  // ... existing directories
];
```

2. Create corresponding directory in `src/posts/`:
```bash
mkdir src/posts/unique-path
```

3. Add example post:
```bash
touch src/posts/unique-path/example-post.md
```

## Styling Guidelines

- Use Tailwind CSS classes for styling
- Maintain cyberpunk theme colors:
  - Primary: cyan-500 (#06b6d4)
  - Secondary: purple-500 (#a855f7)
  - Background: gray-900 (#111827)
  - Text: white, green-400

## Custom Domain Setup

1. Update `public/CNAME` with your domain
2. Configure DNS:
   - Add CNAME record pointing to your hosting provider
   - Wait for DNS propagation (up to 48 hours)

## Security Best Practices

1. Content Security:
   - Sanitize markdown content
   - Validate image URLs
   - Use HTTPS for all external resources

2. Regular Maintenance:
   - Keep dependencies updated
   - Monitor for security advisories
   - Backup content regularly

## Terminal Commands

Available commands:
- `ls`: List all directories
- `cd [directory]`: Navigate to a directory
- `cd ..`: Return to homepage
- `whoami`: Show contact information
- `find [string]`: Search directories
- `clear`: Clear terminal history

## Deployment

1. Build the project:
```bash
npm run build
```

2. Test the build:
```bash
npm run preview
```

3. Deploy to your hosting platform

## Support

For technical issues or questions:
1. Check the error logs
2. Review recent changes
3. Contact the development team

Remember to always backup content before making significant changes!