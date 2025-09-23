# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a JWT authentication test project demonstrating a modern Edge Functions-based authentication system. It showcases server-side JWT authentication using Netlify Edge Functions middleware, similar to Astro's middleware pattern but running at the edge.

## Repository Structure

### Current Implementation (Edge Functions + JWT Middleware)
- `index.html` - Main landing page with conditional login/logout buttons
- `login.html` - Login form that posts to Netlify Functions (no JavaScript required)
- `projects/` - Protected static HTML files
  - `index.html` - Main protected content page
  - `project2.html` - Additional protected content
- `netlify/edge-functions/` - Edge-based authentication middleware
  - `auth-middleware.js` - JWT validation and request interception
  - `lib/auth.js` - Auth utility functions using Web Crypto API
- `netlify/functions/` - Server-side authentication actions
  - `login.js` - Password validation and JWT generation
  - `logout.js` - Cookie clearing and session termination
- `package.json` - Dependencies (jsonwebtoken)
- `netlify.toml` - Netlify configuration with Edge Functions and environment variables

### Previous Implementations
- `option1/` - Client-side JWT implementation with localStorage
- `netlify/functions/protected.js` - (Legacy) Server-side protected content function

## How It Works

### Authentication Flow (Edge Functions Middleware)
1. **Login Request**: User submits password via HTML form POST to `/.netlify/functions/login`
2. **Server Validation**: Netlify function validates password against environment variable
3. **JWT Generation**: Server generates JWT token with 1-hour expiration
4. **Cookie Setting**: JWT stored in HTTP-only, secure cookie
5. **Redirect**: User redirected to `/projects` (protected by Edge Functions)
6. **Middleware Protection**: Edge Functions middleware intercepts all `/projects/*` requests
7. **Token Validation**: Middleware validates JWT using Web Crypto API before serving static files
8. **Access Control**: Valid tokens serve protected static HTML; invalid tokens redirect to login
9. **Logout**: POST to `/.netlify/functions/logout` clears authentication cookie

### Security Features
- **Edge-based Protection**: Authentication runs at CDN edge for global performance
- **HTTP-only cookies**: JWT token inaccessible to JavaScript (prevents XSS attacks)
- **Server-side password validation**: No client-side secrets exposed
- **JWT token expiration**: 1-hour automatic expiration
- **Secure cookie flags**: Secure, SameSite=Strict for enhanced security
- **Web Crypto API**: Modern cryptographic verification at the edge
- **Static file protection**: Protects any static HTML files in `/projects/` directory
- **No-JavaScript fallback**: Core authentication works without JavaScript

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

### Edge Functions Middleware
- **Runtime**: Deno edge runtime with Web APIs
- **Global Distribution**: Runs at 100+ edge locations worldwide
- **JWT Verification**: Custom implementation using Web Crypto API
- **Request Interception**: Protects static files before they're served
- **Cookie Management**: HTTP-only cookies for security

### URL Protection Pattern
- `/projects/*` - All routes protected by Edge Functions middleware
- Login form posts to `/.netlify/functions/login`
- Logout form posts to `/.netlify/functions/logout`
- Static HTML files served directly after JWT validation

### Client-Side Features
**Static UI Elements**:
- Login/logout buttons present on all pages
- JavaScript includes debug console logging for troubleshooting
- Authentication state cannot be determined client-side due to HttpOnly cookies
- Core functionality works without JavaScript

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
1. Create new static HTML file in `projects/` directory
2. Add logout button and conditional UI JavaScript (copy from existing files)
3. No additional configuration needed - Edge Functions middleware automatically protects all `/projects/*` routes

### Adding New Protected Directories
1. Add new Edge Function path in `netlify.toml`:
   ```toml
   [[edge_functions]]
     function = "auth-middleware"
     path = "/admin/*"
   ```
2. Create directory with static HTML files
3. Files automatically protected by existing middleware

### Debugging Authentication Issues
1. **Edge Function Logs**: Check Netlify Edge Functions logs in dashboard
2. **Function Logs**: Check Netlify Functions logs for login/logout operations
3. **Environment Variables**: Verify JWT_SECRET and AUTH_PASSWORD are set correctly
4. **Cookie Inspection**: Use browser dev tools to inspect `authToken` cookie (note: value won't be visible due to HttpOnly flag)
5. **Console Debugging**: Check browser console for detailed authentication debug logs
6. **JWT Validation**: Ensure JWT_SECRET matches between login function and auth middleware

### Cookie Architecture
- **`authToken`**: HTTP-only, secure cookie containing JWT token (server-side only)
- JavaScript cannot access the cookie due to HttpOnly flag (security feature)
- Cookie has 1-hour expiration with Secure and SameSite=Strict flags
- Logout clears the cookie by setting Max-Age=0

### Legacy Cleanup
- `_redirects` file no longer needed (Edge Functions handle routing)
- `netlify/functions/protected.js` can be removed (replaced by Edge Functions middleware)
- Only `login.js` and `logout.js` functions are required for authentication actions