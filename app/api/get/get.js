import { getAuthToken } from '@/app/utils/authUtils';

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
        headers['Authorization'] = token;
    }

    jsonData = await fetch(url, {
        signal,
        headers,
        method: 'GET',
    });

    if(jsonData.status >=500){
        throw{
            code: jsonData.status,
            info: "Something went wrong from server side",
            message: "Internal Server Error, please contact administrator"
        }
    }

    const res = contentType === 'application/json' ? await jsonData.json() : await jsonData.blob();

    if(jsonData.ok){
        return res;
    }

    const error = await defaultErrorHandler({data: res, statusCode: jsonData.status});
    throw error;
   
}

export default get;