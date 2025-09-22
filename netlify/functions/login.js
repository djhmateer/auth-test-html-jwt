const jwt = require('jsonwebtoken');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'auth-test-secret-key-netlify';
const CORRECT_PASSWORD = process.env.AUTH_PASSWORD || '1';

exports.handler = async (event, context) => {
  console.log('=== LOGIN FUNCTION START ===');
  console.log('HTTP Method:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers, null, 2));
  console.log('Body:', event.body);
  console.log('Environment variables available:', {
    JWT_SECRET: process.env.JWT_SECRET ? '[PRESENT]' : '[MISSING]',
    AUTH_PASSWORD: process.env.AUTH_PASSWORD ? '[PRESENT]' : '[MISSING]'
  });

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('❌ Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse form data or JSON
    let password;
    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
    console.log('Content-Type:', contentType);

    if (contentType.includes('application/x-www-form-urlencoded')) {
      console.log('📝 Parsing form data...');
      const params = new URLSearchParams(event.body);
      password = params.get('password');
      console.log('Form parsed, password field:', password ? '[PRESENT]' : '[MISSING]');
    } else {
      console.log('📄 Parsing JSON...');
      const body = JSON.parse(event.body);
      password = body.password;
      console.log('JSON parsed, password field:', password ? '[PRESENT]' : '[MISSING]');
    }

    if (!password) {
      console.log('❌ No password provided');
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
    console.log('🔍 Validating password...');
    console.log('Expected password:', CORRECT_PASSWORD);
    console.log('Received password:', password);
    console.log('Passwords match:', password === CORRECT_PASSWORD);

    if (password !== CORRECT_PASSWORD) {
      console.log('❌ Invalid password provided');
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
    console.log('✅ Password validation successful, generating JWT...');
    const payload = {
      authenticated: true,
      timestamp: Date.now()
    };
    console.log('JWT payload:', payload);

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    console.log('JWT token generated (first 20 chars):', token.substring(0, 20) + '...');

    // Set HTTP-only cookie and redirect to projects
    const cookieValue = `authToken=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`;
    console.log('Setting cookie and redirecting to /projects');
    console.log('Cookie (first 50 chars):', cookieValue.substring(0, 50) + '...');

    return {
      statusCode: 302,
      headers: {
        'Set-Cookie': cookieValue,
        'Location': '/projects'
      },
      body: ''
    };

  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    console.error('Error stack:', error.stack);

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