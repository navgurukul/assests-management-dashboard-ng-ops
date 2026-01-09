import axios from 'axios';

const LOGIN_API_DASHBOARD = process.env.NEXT_PUBLIC_API_BASE_URL;


export const authenticateWithGoogle = async (idToken) => {
  try {
    const response = await axios({
      url: `${LOGIN_API_DASHBOARD}/auth/google`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        idToken: idToken,
        mode: 'web',
      },
    });

    return {
      success: true,
      data: response.data.data,
      status: response.status,
    };
  } catch (error) {
    console.error('Google authentication error:', error);
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
};


export const getUserProfile = async (token) => {
  try {
    const response = await axios({
      url: `${LOGIN_API_DASHBOARD}/users/me`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });

    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error('Get user profile error:', error);
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
};


export const updateUserReferrer = async (token, referrer) => {
  try {
    const response = await axios({
      url: `${LOGIN_API_DASHBOARD}/users/me`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: {
        referrer: referrer,
      },
    });

    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error('Update user referrer error:', error);
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
};
 

export const createAuthHeaders = (token) => {
  return {
    'Content-Type': 'application/json',
    Authorization: token,
  };
};


export const verifyToken = async (token) => {
  try {
    const response = await getUserProfile(token);
    return response.success;
  } catch (error) {
    return false;
  }
};
