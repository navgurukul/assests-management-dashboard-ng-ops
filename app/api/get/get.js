import { getAuthToken, clearAuthData } from '@/app/utils/authUtils';

const handleUnauthorized = () => {
  clearAuthData();
  window.dispatchEvent(new Event('auth:unauthorized'));
};

const defaultErrorHandler = async ({ data, statusCode}) => {
    return {
        code: statusCode,
        message: data?.message || 'An error occurred',
        info: data
    }
}

const get = async ({
    url,
    // xClientId = "partner_app",
    signal,
    contentType = 'application/json',
}) => {
    let jsonData;

    // Get token from localStorage
    const token = getAuthToken();
    
    const headers = {
        'Content-Type': contentType,
        // 'x-client-id': xClientId,
    };

    // Add Authorization header if token exists
    if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    }

    jsonData = await fetch(url, {
        signal,
        headers,
        method: 'GET',
    });

    if(jsonData.status >=500){
        const error = new Error("Internal Server Error, please contact administrator");
        error.code = jsonData.status;
        error.info = "Something went wrong from server side";
        throw error;
    }

    if (jsonData.status === 401) {
        handleUnauthorized();
        const error = new Error('Session expired. Please login again.');
        error.code = 401;
        throw error;
    }

    const res = contentType === 'application/json' ? await jsonData.json() : await jsonData.blob();

    if(jsonData.ok){
        return res;
    }

    const errorData = await defaultErrorHandler({data: res, statusCode: jsonData.status});
    const error = new Error(errorData.message);
    error.code = errorData.code;
    error.info = errorData.info;
    throw error;
   
}

export default get;