// Auth middleware using Netlify Edge Functions
// Similar to Astro middleware but runs at the edge
import { authService } from "./lib/auth.js";

export default async (request, context) => {
  console.log('=== EDGE FUNCTION AUTH MIDDLEWARE ===');

  const url = new URL(request.url);
  console.log('Request URL:', url.pathname);

  // Skip middleware for login page, API routes, and static assets
  if (
    url.pathname === "/login.html" ||
    url.pathname.startsWith("/.netlify/") ||
    url.pathname.startsWith("/_") ||
    (url.pathname.includes(".") && !url.pathname.startsWith("/projects")) // Skip files with extensions except in projects
  ) {
    console.log('⏭️ Skipping middleware for:', url.pathname);
    return; // Continue to next handler
  }

  // Check if this is a protected route (starts with /projects)
  const isProtectedRoute = url.pathname.startsWith("/projects");
  console.log('Is protected route:', isProtectedRoute);

  if (!isProtectedRoute) {
    console.log('✅ Allowing access to non-protected route');
    return; // Allow access to non-protected routes
  }

  console.log('🔒 Processing protected route');

  // Extract JWT token from cookies
  const cookieHeader = request.headers.get("cookie");
  console.log('Cookie header:', cookieHeader ? '[PRESENT]' : '[MISSING]');

  const token = authService.getTokenFromCookies(cookieHeader);
  console.log('Token extracted:', token ? '[PRESENT]' : '[MISSING]');

  if (!token) {
    console.log('❌ No token found, redirecting to login');
    const loginUrl = `/login.html?redirectTo=${encodeURIComponent(url.pathname + url.search)}`;
    return new Response('', {
      status: 302,
      headers: {
        'Location': loginUrl
      }
    });
  }

  // Verify the token
  try {
    console.log('🔍 Verifying token...');
    const tokenResult = await authService.verifyToken(token);

    if (!tokenResult.isValid) {
      console.log('❌ Invalid token, redirecting to login');
      const loginUrl = `/login.html?redirectTo=${encodeURIComponent(url.pathname + url.search)}&error=invalid_session`;
      return new Response('', {
        status: 302,
        headers: {
          'Location': loginUrl
        }
      });
    }

    console.log('✅ Token valid, allowing access');
    // Token is valid, allow access to protected route
    return; // Continue to serve the requested resource

  } catch (error) {
    console.error('❌ Token verification error:', error);
    const loginUrl = `/login.html?redirectTo=${encodeURIComponent(url.pathname + url.search)}&error=invalid_session`;
    return new Response('', {
      status: 302,
      headers: {
        'Location': loginUrl
      }
    });
  }
};


// Configuration for which paths this edge function should run on
export const config = {
  path: ["/projects/*", "/projects"]
};