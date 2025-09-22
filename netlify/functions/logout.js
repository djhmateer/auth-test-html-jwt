exports.handler = async (event, context) => {
  // Only allow POST requests for logout (better security practice)
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'text/html'
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Method Not Allowed</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px; }
            .error { color: red; text-align: center; margin: 20px 0; }
            a { color: #007bff; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="error">Method not allowed</div>
          <div style="text-align: center;">
            <a href="/">← Home</a>
          </div>
        </body>
        </html>
      `
    };
  }

  try {
    // Clear the authentication cookie and redirect to home
    return {
      statusCode: 302,
      headers: {
        // Clear the cookie by setting it to expire in the past
        'Set-Cookie': 'authToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'Location': '/'
      },
      body: ''
    };

  } catch (error) {
    console.error('Logout error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html'
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Logout Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px; }
            .error { color: red; text-align: center; margin: 20px 0; }
            a { color: #007bff; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="error">Logout failed. Please try again.</div>
          <div style="text-align: center;">
            <a href="/">← Home</a>
          </div>
        </body>
        </html>
      `
    };
  }
};