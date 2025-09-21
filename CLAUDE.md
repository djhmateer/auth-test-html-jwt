# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a simple HTML-based authentication test project focused on JWT (JSON Web Token) functionality. The repository contains minimal static HTML files for testing authentication flows.

## Repository Structure

- `index.html` - Main entry point with basic "hello world" content and link to projects
- `projects/` - Directory containing project-specific content
  - `projects/index.html` - Simple projects directory page

## Development

This is a static HTML project with no build system, package management, or dependencies. Files can be opened directly in a web browser or served using any static file server.

To serve locally:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if available)
npx serve .
```

## Project Context

The project appears to be a test environment for authentication mechanisms, specifically JWT-based authentication. The minimal structure suggests this is used for experimentation or testing rather than production use.