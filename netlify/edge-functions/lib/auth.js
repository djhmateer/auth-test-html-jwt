// Auth utility functions for Edge Functions
// Using Web APIs available in Deno runtime

export class AuthService {
  constructor() {
    this.JWT_SECRET = Deno.env.get('JWT_SECRET') || 'auth-test-secret-key-netlify';
  }

  // Extract token from cookie header
  getTokenFromCookies(cookieHeader) {
    if (!cookieHeader) return null;

    const cookies = {};
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });

    return cookies.authToken || null;
  }

  // Verify JWT token using Web Crypto API
  async verifyToken(token) {
    try {
      console.log('🔍 Starting JWT verification...');

      // Split the JWT into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { isValid: false, error: 'Invalid JWT format' };
      }

      const [headerB64, payloadB64, signatureB64] = parts;

      // Decode header and payload
      const header = JSON.parse(this.base64UrlDecode(headerB64));
      const payload = JSON.parse(this.base64UrlDecode(payloadB64));

      console.log('JWT payload:', payload);

      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        console.log('❌ Token is expired');
        return { isValid: false, error: 'Token has expired' };
      }

      // Verify signature using Web Crypto API
      const isSignatureValid = await this.verifySignature(
        `${headerB64}.${payloadB64}`,
        signatureB64,
        this.JWT_SECRET
      );

      if (!isSignatureValid) {
        console.log('❌ Invalid signature');
        return { isValid: false, error: 'Invalid signature' };
      }

      console.log('✅ JWT verification successful');
      return { isValid: true, payload };

    } catch (error) {
      console.error('❌ JWT verification failed:', error);
      return { isValid: false, error: error.message };
    }
  }

  // Verify HMAC SHA256 signature using Web Crypto API
  async verifySignature(data, signature, secret) {
    try {
      // Import the secret key
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      // Decode the signature
      const signatureBytes = this.base64UrlDecodeToUint8Array(signature);

      // Verify the signature
      const isValid = await crypto.subtle.verify(
        'HMAC',
        key,
        signatureBytes,
        new TextEncoder().encode(data)
      );

      return isValid;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  // Base64 URL decode to string
  base64UrlDecode(str) {
    // Add padding if needed
    str += '='.repeat((4 - str.length % 4) % 4);
    // Replace URL-safe characters
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    // Decode
    return atob(str);
  }

  // Base64 URL decode to Uint8Array
  base64UrlDecodeToUint8Array(str) {
    const decoded = this.base64UrlDecode(str);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
  }
}

// Export singleton instance
export const authService = new AuthService();