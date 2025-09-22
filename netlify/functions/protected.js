const jwt = require('jsonwebtoken');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'auth-test-secret-key-netlify';

// Helper function to parse cookies
function parseCookies(cookieHeader) {
  const cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
  }
  return cookies;
}

// Helper function to verify JWT
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, payload: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Generate protected content HTML
function generateProtectedContent() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Projects - Auth Test</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 50px auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .header {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin-bottom: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .content {
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #333;
                margin: 0;
            }
            .logout-form {
                margin: 0;
            }
            .logout-btn {
                background-color: #dc3545;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
            }
            .logout-btn:hover {
                background-color: #c82333;
            }
            .home-link {
                color: #007bff;
                text-decoration: none;
                margin-right: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔒 Secret Projects Directory</h1>
            <div>
                <a href="/" class="home-link">← Home</a>
                <form action="/.netlify/functions/logout" method="POST" class="logout-form" style="display: inline;">
                    <button type="submit" class="logout-btn">Logout</button>
                </form>
            </div>
        </div>

        <div class="content">
            <h2>🎉 Protected Content (Server-Side Authentication)</h2>
            <p><strong>Congratulations!</strong> You have successfully authenticated using Netlify Functions + JWT.</p>

            <div style="background-color: #d4edda; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #28a745;">
                <strong>✅ Authentication Method:</strong> Server-side JWT validation with HTTP-only cookies
            </div>

            <h3>🚀 Available Projects:</h3>
            <ul>
                <li><strong>Project Alpha</strong> - Next-gen web authentication</li>
                <li><strong>Project Beta</strong> - Serverless security framework</li>
                <li><strong>Project Gamma</strong> - JWT implementation patterns</li>
            </ul>

            <h3>🔐 Security Features:</h3>
            <ul>
                <li>✅ Server-side password validation</li>
                <li>✅ HTTP-only cookies (XSS protection)</li>
                <li>✅ JWT token expiration (1 hour)</li>
                <li>✅ No client-side secrets</li>
                <li>✅ Works without JavaScript</li>
            </ul>

            <p><em>This page is generated server-side by a Netlify Function after validating your JWT token.</em></p>
        </div>
    </body>
    </html>
  `;
}

exports.handler = async (event, context) => {
  try {
    // Parse cookies from request
    const cookies = parseCookies(event.headers.cookie);
    const authToken = cookies.authToken;

    // Check if token exists
    if (!authToken) {
      return {
        statusCode: 302,
        headers: {
          'Location': '/login.html'
        },
        body: ''
      };
    }

    // Verify JWT token
    const tokenResult = verifyToken(authToken);

    if (!tokenResult.valid) {
      // Invalid or expired token - clear cookie and redirect to login
      return {
        statusCode: 302,
        headers: {
          'Set-Cookie': 'authToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
          'Location': '/login.html'
        },
        body: ''
      };
    }

    // Token is valid - return protected content
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: generateProtectedContent()
    };

  } catch (error) {
    console.error('Protected route error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html'
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Server Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px; }
            .error { color: red; text-align: center; margin: 20px 0; }
            a { color: #007bff; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="error">Server error occurred</div>
          <div style="text-align: center;">
            <a href="/">← Home</a>
          </div>
        </body>
        </html>
      `
    };
  }
};