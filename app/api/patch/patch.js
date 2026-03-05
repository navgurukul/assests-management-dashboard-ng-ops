import { getAuthToken } from '@/app/utils/authUtils';

const patch = async ({
  url,
  data = null,
}) => {
  try {
    const token = getAuthToken();

    const headers = {};
    const isFormData = data instanceof FormData;

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: data ? (isFormData ? data : JSON.stringify(data)) : null,
      credentials: 'include',
    });

    if (response.status >= 500) {
      throw {
        code: response.status,
        message: 'Server error. Please try again later.',
        requestId: response.headers.get('X-Request-Id'),
      };
    }

    const contentType = response.headers.get('content-type');
    let result;

    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = { success: response.ok };
    }

    if (response.ok) {
      return result;
    }

    throw {
      status: response.status,
      message: result?.message || 'Request failed',
      errors: result?.errors || null,
    };
  } catch (err) {
    throw {
      status: err.status || 500,
      message: err.message || 'Something went wrong',
      errors: err.errors || null,
    };
  }
};

export default patch;
