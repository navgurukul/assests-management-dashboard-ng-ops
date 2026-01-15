import { getAuthToken } from '@/app/utils/authUtils';

const post = async ({
  url,
  method = "POST",
  data = null,
}) => {
  try {
    // Get token from localStorage
    const token = getAuthToken();
   
    const headers = {};
   
    // Check if data is FormData (for file uploads)
    const isFormData = data instanceof FormData;
    
    // Only set Content-Type for JSON data
    // For FormData, browser will set it automatically with boundary
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }
   
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = token;
    }
   
    const response = await fetch(url, {
      method,
      headers,
      body: data ? (isFormData ? data : JSON.stringify(data)) : null,
      credentials: "include"
    });

    // Handle 5xx Server Errors
    if (response.status >= 500) {
      throw {
        code: response.status,
        message: "Server error. Please try again later.",
        requestId: response.headers.get("X-Request-Id")
      };
    }

    // Handle empty body (DELETE or 204 response)
    const contentType = response.headers.get("content-type");
    let result;

    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      result = { success: response.ok };
    }

    if (response.ok) {
      return result;
    }

    // For non-200 error responses
    throw {
      status: response.status,
      message: result?.message || "Request failed",
      errors: result?.errors || null
    };

  } catch (err) {
    // Final catch — pure JS error
    throw {
      status: err.status || 500,
      message: err.message || "Something went wrong",
      errors: err.errors || null
    };
  }
};

export default post;