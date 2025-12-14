# Google Authentication API Implementation Guide

## Overview

This guide provides API implementation instructions for Google OAuth authentication in the FTIP Unpad Alumni Club frontend application.

**IMPORTANT**: The backend expects **Google ID Tokens** (JWT format), not access tokens or session identifiers. You must properly implement Google Sign-In to obtain valid ID tokens.

**🚨 Google-Only Authentication**: This system uses Google OAuth exclusively. Email/password authentication has been disabled for enhanced security.

---

## 🚨 Critical: Google ID Token Requirements

### What We Need vs What We Don't Need

✅ **WE NEED: Google ID Token (JWT format)**
```
eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlNdkwM... (long string with 3 dots)
```

❌ **WE DON'T NEED:**
- Session identifiers like: `google-auth-1765116596317`
- OAuth access tokens
- Authorization codes

### How to Get Google ID Tokens

#### Option 1: Google Sign-In for Web (Recommended)

1. **Load Google Sign-In script:**
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

2. **Initialize Google Sign-In:**
```javascript
function initializeGoogleSignIn() {
  google.accounts.id.initialize({
    client_id: "YOUR_GOOGLE_CLIENT_ID", // Get from backend .env file
    callback: handleGoogleSignIn,
    auto_select: false,
    cancel_on_tap_outside: true
  });

  // Render the sign-in button
  google.accounts.id.renderButton(
    document.getElementById("google-signin-button"),
    {
      theme: "filled_blue",
      size: "large",
      text: "signin_with",
      shape: "rectangular",
      logo_alignment: "left"
    }
  );
}

// This callback receives the ID token
function handleGoogleSignIn(response) {
  // response.credential contains the Google ID token
  const idToken = response.credential;

  console.log("Received Google ID token:", idToken.substring(0, 50) + "...");

  // Validate the token format
  if (!idToken.includes('.') || idToken.split('.').length !== 3) {
    console.error("Invalid ID token format received");
    return;
  }

  // Send the ID token to your backend
  sendToBackend(idToken);
}
```

#### Option 2: One Tap Sign-Up

```javascript
function initializeOneTap() {
  google.accounts.id.initialize({
    client_id: "YOUR_GOOGLE_CLIENT_ID",
    callback: handleGoogleSignIn,
    auto_select: false,
    cancel_on_tap_outside: true
  });

  // Display One Tap
  google.accounts.id.prompt();
}
```

### Token Validation Checklist

Before sending the token to backend:

```javascript
const validateGoogleIdToken = (token) => {
  // 1. Check if it's a string
  if (typeof token !== 'string') {
    return false;
  }

  // 2. Check JWT format (3 segments separated by dots)
  const segments = token.split('.');
  if (segments.length !== 3) {
    return false;
  }

  // 3. Check reasonable length (ID tokens are usually long)
  if (token.length < 100) {
    return false;
  }

  // 4. Basic base64 validation
  try {
    segments.forEach(segment => {
      if (segment.length > 0) {
        // Pad base64 if needed and try to decode
        const padded = segment + '='.repeat((4 - segment.length % 4) % 4);
        btoa(atob(padded));
      }
    });
    return true;
  } catch (error) {
    return false;
  }
};

// Usage
function handleGoogleSignIn(response) {
  const idToken = response.credential;

  if (!validateGoogleIdToken(idToken)) {
    console.error("Invalid Google ID token format");
    alert("Invalid authentication token. Please try again.");
    return;
  }

  // Token is valid, send to backend
  sendToBackend(idToken);
}
```

## Base URL

```
http://localhost:8000
```

## Available Endpoints

| Method | Endpoint                   | Description                        |
| ------ | -------------------------- | ---------------------------------- |
| `GET`  | `/auth/google`             | Get Google OAuth URL               |
| `POST` | `/auth/google`             | Login existing user with Google    |
| `POST` | `/auth/google/register`    | Register new user with Google      |
| `GET`  | `/auth/google/callback`    | Google OAuth callback (full flow)  |

---

## API Endpoints

### 1. Get Google Auth URL

**Endpoint:** `GET /auth/google`

Get Google OAuth URL for manual authentication flow.

**Success Response (200):**

```json
{
  "message": "Google OAuth URL generated",
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

---

### 2. Register with Google

**Endpoint:** `POST /auth/google/register`

Register a new user using Google authentication.

**Headers:**

```http
Content-Type: application/json
```

**Request Body:**

```json
{
  "token": "google-id-token-from-frontend",
  "department": "TEP",
  "classYear": 2020
}
```

**Field Validation:**

- `token`: Valid Google ID token (required)
- `department`: Must be one of: `"TEP"`, `"TPN"`, `"TIN"`
- `classYear`: Integer between 1983 and current year

**Success Response (201):**

```json
{
  "success": true,
  "message": "Pendaftaran dengan Google berhasil! Selamat bergabung dengan FTIP Unpad Alumni Club.",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@gmail.com",
      "name": "Google User Name",
      "role": "USER",
      "createdAt": "2024-12-14T10:00:00.000Z"
    },
    "alumniProfile": {
      "id": "profile-uuid",
      "fullName": "Google User Name",
      "department": "TEP",
      "classYear": 2020,
      "createdAt": "2024-12-14T10:00:00.000Z"
    },
    "token": "jwt-token-for-session-management",
    "expiresIn": "7d"
  }
}
```

**Error Responses:**

**400 Bad Request - Invalid Token:**

```json
{
  "error": "Google token verification failed: Invalid token"
}
```

**400 Bad Request - Email Not Verified:**

```json
{
  "error": "Email belum diverifikasi oleh Google"
}
```

**400 Bad Request - Email Already Registered:**

```json
{
  "error": "Email sudah terdaftar. Silakan login."
}
```

---

### 3. Login with Google

**Endpoint:** `POST /auth/google`

Login using Google ID token (for already registered users).

**Headers:**

```http
Content-Type: application/json
```

**Request Body:**

```json
{
  "token": "google-id-token-from-frontend"
}
```

**Success Response (200):**

```json
{
  "message": "Login dengan Google berhasil",
  "user": {
    "id": "user-uuid",
    "email": "user@gmail.com",
    "name": "Google User Name",
    "role": "USER",
    "profile": {
      "id": "profile-uuid",
      "fullName": "Google User Name",
      "department": "TEP",
      "classYear": 2020,
      "city": null,
      "industry": null,
      "employmentLevel": null,
      "jobTitle": null,
      "companyName": null
    },
    "createdAt": "2024-12-14T10:00:00.000Z"
  },
  "token": "jwt-token-for-session-management"
}
```

**Error Responses:**

**400 Bad Request - Invalid Token:**

```json
{
  "error": "Google token verification failed: Invalid token"
}
```

**400 Bad Request - Email Not Verified:**

```json
{
  "error": "Email belum diverifikasi oleh Google"
}
```

**400 Bad Request - Email Not Registered:**

```json
{
  "error": "Email Anda belum terdaftar di sistem FTIP Unpad Alumni Club. Silakan daftar terlebih dahulu melalui halaman pendaftaran."
}
```

---

## API Implementation Examples

### Registration API Call

```javascript
const registerWithGoogle = async (googleToken, registrationData) => {
  try {
    const response = await fetch("http://localhost:8000/auth/google/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: googleToken,
        department: registrationData.department,
        classYear: registrationData.classYear,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Google registration failed");
    }

    // Store authentication data
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("user", JSON.stringify(data.data.user));

    return data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Usage example - WITH PROPER GOOGLE SIGN-IN:
const handleGoogleRegistration = async (googleSignInResponse) => {
  try {
    // ✅ Extract the ID token from Google Sign-In response
    const idToken = googleSignInResponse.credential;

    // ✅ Validate the token format before sending
    if (!idToken.includes('.') || idToken.split('.').length !== 3) {
      throw new Error("Invalid Google ID token format");
    }

    const result = await registerWithGoogle(idToken, {
      department: "TEP",
      classYear: 2020,
    });

    console.log("Registration successful:", result);
    // Redirect to dashboard
    window.location.href = "/dashboard";
  } catch (error) {
    console.error("Registration error:", error);
    alert(error.message);
  }
};
```

### Login API Call

```javascript
const loginWithGoogle = async (googleToken) => {
  try {
    const response = await fetch("http://localhost:8000/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: googleToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Google login failed");
    }

    // Store authentication data
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Usage example - WITH PROPER GOOGLE SIGN-IN:
const handleGoogleLogin = async (googleSignInResponse) => {
  try {
    // ✅ Extract the ID token from Google Sign-In response
    const idToken = googleSignInResponse.credential;

    // ✅ Validate the token format before sending
    if (!idToken.includes('.') || idToken.split('.').length !== 3) {
      throw new Error("Invalid Google ID token format");
    }

    const result = await loginWithGoogle(idToken);

    console.log("Login successful:", result);
    // Redirect to dashboard
    window.location.href = "/dashboard";
  } catch (error) {
    console.error("Login error:", error);
    alert(error.message);
  }
};
```

### Authenticated API Requests

```javascript
const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  // Handle token expiration
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Session expired. Please login again.");
  }

  return response;
};

// Example usage:
const getUserProfile = async () => {
  try {
    const response = await authenticatedFetch(
      "http://localhost:8000/users/profile"
    );
    const profile = await response.json();
    return profile;
  } catch (error) {
    console.error("Profile fetch error:", error);
    throw error;
  }
};
```

---

## Error Handling

### Common Error Messages

| Error Message                                     | Description                               | Suggested Action                  |
| ------------------------------------------------- | ----------------------------------------- | -------------------------------- |
| `Email Anda belum terdaftar`                      | Google email not in database              | Redirect to registration          |
| `Email sudah terdaftar`                           | Email already exists                      | Redirect to login                 |
| `Google token verification failed`                | Invalid Google token                      | Ask user to retry Google sign-in  |
| `Email belum diverifikasi oleh Google`            | Email not verified by Google              | Ask user to verify email first    |
| `Invalid token format. Expected Google JWT ID token` | Wrong token format received              | Fix frontend Google Sign-In       |
| `Wrong number of segments in token`               | Session identifier instead of ID token    | Fix frontend to extract proper ID token |

### Error Handling Implementation

```javascript
const handleAuthError = (error) => {
  const errorMessages = {
    "Email Anda belum terdaftar":
      "Your Google account is not registered. Please register first.",
    "Email sudah terdaftar":
      "Google account already exists. Please use login instead.",
    "Email belum diverifikasi oleh Google":
      "Please verify your email with Google first.",
    "Google token verification failed":
      "Invalid Google token. Please try signing in again.",
    "Invalid token format. Expected Google JWT ID token":
      "Authentication error. Please use Google Sign-In button to authenticate.",
    "Wrong number of segments in token":
      "Invalid authentication token. Please use the Google Sign-In button.",
    "This appears to be a session identifier":
      "Authentication error. Please ensure you're using Google Sign-In properly.",
  };

  const userMessage = errorMessages[error.message] || error.message;
  alert(userMessage);

  // Redirect based on error type
  if (error.message.includes("belum terdaftar")) {
    window.location.href = "/register";
  } else if (error.message.includes("sudah terdaftar")) {
    window.location.href = "/login";
  } else if (error.message.includes("token") || error.message.includes("session")) {
    // Token format errors - reload page to reset auth state
    console.error("Token format error detected:", error.message);
    window.location.reload();
  }
};
```

---

## Token Management

### Store and Retrieve Tokens

```javascript
// Store authentication data
const storeAuthData = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

// Retrieve token
const getToken = () => {
  return localStorage.getItem("token");
};

// Retrieve user data
const getUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// Check if authenticated
const isAuthenticated = () => {
  return !!getToken();
};

// Logout
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};
```

### Token Validation

```javascript
const validateToken = () => {
  const token = getToken();
  if (!token) return false;

  try {
    // Basic JWT structure check
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Check expiration (simple check)
    const payload = JSON.parse(atob(parts[1]));
    const now = Date.now() / 1000;

    if (payload.exp && payload.exp < now) {
      logout();
      return false;
    }

    return true;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};
```

---

## Database Schema

### User Model

The User model now contains only Google authentication fields:

```typescript
interface User {
  id: string;                    // Primary key
  email: string;                 // User's email (unique)
  name: string | null;           // User's name from Google
  googleId: string | null;       // Google ID (unique)
  role: 'USER' | 'ADMIN';        // User role
  deletedAt: Date | null;        // Soft delete timestamp
  createdAt: Date;               // Account creation date
  updatedAt: Date;               // Last update date
}
```

### AlumniProfile Model

Extended profile information for alumni:

```typescript
interface AlumniProfile {
  id: string;                    // Primary key
  userId: string;                // Foreign key to User
  fullName: string;              // Full name
  department: 'TEP' | 'TPN' | 'TIN';  // FTIP department
  classYear: number;             // Class year
  city: string | null;           // Current city
  industry: string | null;       // Industry field
  employmentLevel: string | null;  // Employment level
  incomeRange: string | null;    // Income range
  jobTitle: string | null;       // Current job title
  companyName: string | null;    // Current company
  linkedInUrl: string | null;    // LinkedIn profile URL
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Testing API Calls

### Test Registration

```javascript
// Test registration with mock Google token
const testRegistration = async () => {
  try {
    const response = await fetch("http://localhost:8000/auth/google/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: "mock-google-token",
        department: "TEP",
        classYear: 2020,
      }),
    });

    const data = await response.json();
    console.log("Registration test result:", data);
  } catch (error) {
    console.error("Registration test failed:", error);
  }
};
```

### Test Login

```javascript
// Test login with mock Google token
const testLogin = async () => {
  try {
    const response = await fetch("http://localhost:8000/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: "mock-google-token",
      }),
    });

    const data = await response.json();
    console.log("Login test result:", data);
  } catch (error) {
    console.error("Login test failed:", error);
  }
};
```

---

## Security Notes

### Google Token Verification

The backend implements robust Google token verification:

1. **Token Format Validation**: Validates JWT structure and segments
2. **Google OAuth2 Verification**: Uses Google's official OAuth2 client library
3. **Token Expiration**: Checks token expiration time
4. **Email Verification**: Ensures Google account email is verified
5. **Audience Validation**: Verifies token matches client ID
6. **Issuer Validation**: Ensures token is from Google

### Session Management

- **JWT Tokens**: Backend issues signed JWT tokens for session management
- **7-Day Expiration**: Tokens expire after 7 days for security
- **Bearer Authentication**: Use `Authorization: Bearer <token>` header
- **Auto-Logout**: Frontend should handle 401 responses and logout users

### Rate Limiting

The API implements rate limiting for security:

- **General**: 100 requests per 15 minutes
- **Authentication**: 15 requests per 5 minutes
- **Admin**: 50 requests per 15 minutes

---

## Summary

The Google Authentication API provides a secure, Google-only authentication system with the following endpoints:

1. **`GET /auth/google`** - Get Google OAuth URL (optional for manual flow)
2. **`POST /auth/google`** - Login existing Google users
3. **`POST /auth/google/register`** - Register new Google users (requires department and classYear)
4. **`GET /auth/google/callback`** - OAuth callback (for full flow)

### 🚨 CRITICAL REMINDERS

1. **Use Google Sign-In for Web** - Load `https://accounts.google.com/gsi/client`
2. **Extract `response.credential`** - This contains the Google ID token
3. **Validate JWT format** - Must have 3 segments separated by dots
4. **NEVER send session identifiers** - Tokens like `google-auth-1765116596317` will fail
5. **Store tokens securely** and handle various error scenarios appropriately

### Quick Implementation Checklist

- [ ] Load Google Sign-In script
- [ ] Initialize with correct `client_id`
- [ ] Extract `response.credential` from callback
- [ ] Validate JWT format before sending
- [ ] Send only the ID token to backend
- [ ] Handle authentication errors properly
- [ ] Store returned JWT securely
- [ ] Use Bearer token for authenticated requests

### Debugging Tips

If you encounter "google-auth-*" errors:
1. Check console logs for token format validation
2. Ensure you're using `response.credential` from Google Sign-In
3. Verify the token is a JWT (3 segments with dots)
4. Make sure Google Sign-In is properly initialized

**Working Example:**
```javascript
function handleGoogleSignIn(response) {
  const idToken = response.credential; // ✅ Correct
  if (idToken && idToken.includes('.') && idToken.split('.').length === 3) {
    sendToBackend(idToken); // ✅ This works
  }
}
```

---

## Migration from Email/Password Auth

The system has been migrated from mixed authentication (email/password + Google) to Google-only authentication:

### Removed Features:
- Email/password registration
- Email/password login
- Password change functionality
- `authProvider` field tracking
- Password-related database fields

### Current Features:
- Google OAuth authentication only
- JWT session management
- Secure token verification
- Enhanced security posture

This migration significantly improves security and simplifies the authentication flow while maintaining full functionality through Google's trusted authentication system.