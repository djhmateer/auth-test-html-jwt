# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a JWT authentication test project with multiple implementation approaches. It demonstrates different methods of implementing JWT-based authentication, from client-side to full server-side solutions using Netlify Functions.

## Repository Structure

### Current Implementation (Option 2: Netlify Functions + JWT)
- `index.html` - Main landing page showcasing server-side authentication features
- `login.html` - Login form that posts to Netlify Functions (no JavaScript required)
- `netlify/functions/` - Server-side authentication logic
  - `login.js` - Password validation and JWT generation
  - `protected.js` - JWT validation and protected content serving
  - `logout.js` - Cookie clearing and session termination
- `package.json` - Dependencies (jsonwebtoken)
- `netlify.toml` - Netlify configuration with redirects and environment variables

### Previous Implementations
- `option1/` - Client-side JWT implementation with localStorage

## How It Works

### Authentication Flow (Server-Side)
1. **Login Request**: User submits password via HTML form POST to `/.netlify/functions/login`
2. **Server Validation**: Netlify function validates password against environment variable
3. **JWT Generation**: Server generates JWT token with 1-hour expiration
4. **Cookie Setting**: JWT stored in HTTP-only, secure cookie
5. **Redirect**: User redirected to `/projects` (which maps to `/.netlify/functions/protected`)
6. **Access Control**: Protected function validates JWT cookie before serving content
7. **Logout**: POST to `/.netlify/functions/logout` clears authentication cookie

### Security Features
- HTTP-only cookies (prevents XSS attacks)
- Server-side password validation (no client-side secrets)
- JWT token expiration (1 hour)
- Secure cookie flags (Secure, SameSite=Strict)
- Works without JavaScript (accessibility + security)

## Development Commands

### Local Development
```bash
# Install dependencies
npm install

# For local testing, deploy to Netlify and test on live site
# Functions require Netlify's runtime environment
```

### Testing Authentication
1. Deploy to Netlify (see Production Deployment)
2. Visit your deployed site URL
3. Click "Protected Projects" - should redirect to login
4. Enter password: `1`
5. Should be redirected to protected content
6. Test logout functionality

### Production Deployment
```bash
# Deploy to Netlify via dashboard or Git integration
# Manual deployment via CLI requires netlify-cli (not included)
# Recommend using Netlify's Git integration for automatic deploys
```

## Environment Variables

### Required for Production
Set these in Netlify dashboard or via CLI:

```bash
# JWT signing secret (change this!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Authentication password
AUTH_PASSWORD=1
```

### Local Development
Environment variables are defined in `netlify.toml` for local development.

## Key Implementation Details

### Netlify Functions
- **Runtime**: Node.js serverless functions
- **Dependencies**: `jsonwebtoken` for JWT handling
- **Cookie Management**: HTTP-only cookies for security
- **Error Handling**: Graceful fallbacks with HTML error pages

### URL Routing
- `/projects` → `/.netlify/functions/protected` (via netlify.toml redirect)
- Login form posts to `/.netlify/functions/login`
- Logout form posts to `/.netlify/functions/logout`

### No-JavaScript Compatibility
The entire authentication flow works without JavaScript:
- HTML forms for user input
- Server-side redirects for navigation
- HTTP-only cookies for session management
- Server-rendered content and error pages

## Common Development Tasks

### Changing the Password
Update the `AUTH_PASSWORD` environment variable in:
- `netlify.toml` (local development)
- Netlify dashboard (production)

### Modifying JWT Expiration
Edit the `expiresIn` parameter in `netlify/functions/login.js`:
```javascript
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' }); // 2 hours
```

### Adding New Protected Routes
1. Create new Netlify function in `netlify/functions/`
2. Copy JWT validation logic from `protected.js`
3. Add redirect in `netlify.toml` if needed

### Debugging Authentication Issues
1. Check Netlify function logs in dashboard or local console
2. Verify environment variables are set correctly
3. Test cookie setting/clearing in browser dev tools
4. Ensure JWT_SECRET matches between login and validation functions