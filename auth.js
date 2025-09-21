// JWT Authentication utilities
const AUTH_CONFIG = {
    SECRET_KEY: 'auth-test-secret-key',
    TOKEN_KEY: 'authToken'
};

// Validate JWT token
function validateToken() {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);

    if (!token) {
        return false;
    }

    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return false;
        }

        const [header, payload, signature] = parts;

        // Verify signature
        const expectedSignature = btoa(AUTH_CONFIG.SECRET_KEY + header + payload);
        if (signature !== expectedSignature) {
            return false;
        }

        // Check payload
        const decodedPayload = JSON.parse(atob(payload));

        // Check if token is expired
        if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
            localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
            return false;
        }

        return decodedPayload.authenticated === true;
    } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
        return false;
    }
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!validateToken()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    window.location.href = '/';
}

// Check if user is authenticated
function isAuthenticated() {
    return validateToken();
}