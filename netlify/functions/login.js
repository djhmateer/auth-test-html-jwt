const jwt = require('jsonwebtoken');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'auth-test-secret-key-netlify';
const CORRECT_PASSWORD = process.env.AUTH_PASSWORD || '1';

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse form data or JSON
    let password;

    if (event.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      // Parse form data
      const params = new URLSearchParams(event.body);
      password = params.get('password');
    } else {
      // Parse JSON
      const body = JSON.parse(event.body);
      password = body.password;
    }

    if (!password) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'text/html'
        },
        body: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Login Error</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px; }
              .error { color: red; text-align: center; margin: 20px 0; }
              a { color: #007bff; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="error">Password is required</div>
            <div style="text-align: center;">
              <a href="/login.html">← Try again</a>
            </div>
          </body>
          </html>
        `
      };
    }

    // Validate password
    if (password !== CORRECT_PASSWORD) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'text/html'
        },
        body: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Login Error</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px; }
              .error { color: red; text-align: center; margin: 20px 0; }
              a { color: #007bff; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="error">Invalid password</div>
            <div style="text-align: center;">
              <a href="/login.html">← Try again</a>
            </div>
          </body>
          </html>
        `
      };
    }

    // Generate JWT
    const payload = {
      authenticated: true,
      timestamp: Date.now()
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // Set HTTP-only cookie and redirect to projects
    return {
      statusCode: 302,
      headers: {
        'Set-Cookie': `authToken=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`,
        'Location': '/projects'
      },
      body: ''
    };

  } catch (error) {
    console.error('Login error:', error);

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
            <a href="/login.html">← Try again</a>
          </div>
        </body>
        </html>
      `
    };
  }
};