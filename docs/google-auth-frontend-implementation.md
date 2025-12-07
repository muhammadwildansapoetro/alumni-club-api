# Google Authentication API Implementation Guide

## Overview

This guide provides API implementation instructions for Google OAuth authentication in the FTIP Unpad Alumni Club frontend application.

## Base URL

```
http://localhost:8000
```

## Available Endpoints

| Method | Endpoint                | Description                     |
| ------ | ----------------------- | ------------------------------- |
| `POST` | `/auth/google/register` | Register new user with Google   |
| `POST` | `/auth/google`          | Login existing user with Google |

---

## API Endpoints

### 1. Register with Google

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
      "authProvider": "GOOGLE",
      "createdAt": "2024-12-07T10:00:00.000Z"
    },
    "alumniProfile": {
      "id": "profile-uuid",
      "fullName": "Google User Name",
      "department": "TEP",
      "classYear": 2020,
      "createdAt": "2024-12-07T10:00:00.000Z"
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
  "error": "Email sudah terdaftar dengan metode login biasa. Silakan login dengan password."
}
```

**400 Bad Request - Google Account Already Exists:**

```json
{
  "error": "Akun Google sudah terdaftar. Silakan login."
}
```

---

### 2. Login with Google

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
    "authProvider": "GOOGLE",
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
    "createdAt": "2024-12-07T10:00:00.000Z"
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

**400 Bad Request - Wrong Auth Method:**

```json
{
  "error": "Email sudah terdaftar dengan metode login biasa. Silakan login dengan password."
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

// Usage example:
const handleGoogleRegistration = async (googleCredential) => {
  try {
    const result = await registerWithGoogle(googleCredential, {
      department: "TEP",
      classYear: 2020,
    });

    console.log("Registration successful:", result);
    // Redirect to dashboard
    window.location.href = "/dashboard";
  } catch (error) {
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

// Usage example:
const handleGoogleLogin = async (googleCredential) => {
  try {
    const result = await loginWithGoogle(googleCredential);

    console.log("Login successful:", result);
    // Redirect to dashboard
    window.location.href = "/dashboard";
  } catch (error) {
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

| Error Message                                     | Description                  | Suggested Action                 |
| ------------------------------------------------- | ---------------------------- | -------------------------------- |
| `Email Anda belum terdaftar`                      | Google email not in database | Redirect to registration         |
| `Email sudah terdaftar dengan metode login biasa` | Email uses password auth     | Show password login option       |
| `Akun Google sudah terdaftar`                     | Google account exists        | Redirect to login                |
| `Google token verification failed`                | Invalid Google token         | Ask user to retry Google sign-in |
| `Email belum diverifikasi oleh Google`            | Email not verified by Google | Ask user to verify email first   |

### Error Handling Implementation

```javascript
const handleAuthError = (error) => {
  const errorMessages = {
    "Email Anda belum terdaftar":
      "Your Google account is not registered. Please register first.",
    "Email sudah terdaftar dengan metode login biasa":
      "This email uses password login. Please use password login.",
    "Akun Google sudah terdaftar":
      "Google account already exists. Please use login instead.",
    "Email belum diverifikasi oleh Google":
      "Please verify your email with Google first.",
    "Google token verification failed":
      "Invalid Google token. Please try signing in again.",
  };

  const userMessage = errorMessages[error.message] || error.message;
  alert(userMessage);

  // Redirect based on error type
  if (error.message.includes("belum terdaftar")) {
    window.location.href = "/register";
  } else if (error.message.includes("sudah terdaftar")) {
    window.location.href = "/login";
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

## API Response Format

### Success Response Structure

```javascript
// Registration success response format
const registrationResponse = {
  success: true,
  message:
    "Pendaftaran dengan Google berhasil! Selamat bergabung dengan FTIP Unpad Alumni Club.",
  data: {
    user: {
      id: "string",
      email: "string",
      name: "string",
      role: "USER",
      authProvider: "GOOGLE",
      createdAt: "ISO-date",
    },
    alumniProfile: {
      id: "string",
      fullName: "string",
      department: "TEP|TPN|TIN",
      classYear: "number",
      createdAt: "ISO-date",
    },
    token: "JWT-string",
    expiresIn: "7d",
  },
};

// Login success response format
const loginResponse = {
  message: "Login dengan Google berhasil",
  user: {
    id: "string",
    email: "string",
    name: "string",
    role: "USER",
    authProvider: "GOOGLE",
    profile: {
      id: "string",
      fullName: "string",
      department: "TEP|TPN|TIN",
      classYear: "number",
      city: "string|null",
      industry: "string|null",
      employmentLevel: "string|null",
      jobTitle: "string|null",
      companyName: "string|null",
    },
    createdAt: "ISO-date",
  },
  token: "JWT-string",
};
```

### Error Response Format

```javascript
const errorResponse = {
  error: "Error message string",
};
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

## Summary

The Google Authentication API provides two main endpoints:

1. **`POST /auth/google/register`** - For new users (requires department and classYear)
2. **`POST /auth/google`** - For existing Google users

Both endpoints require a Google ID token and return JWT tokens for session management. Store tokens securely and handle the various error scenarios appropriately.
