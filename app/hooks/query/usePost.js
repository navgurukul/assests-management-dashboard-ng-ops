import { useMutation } from '@tanstack/react-query';
import apiService from '@/app/utils/apiService';

function usePost(options = {}) {
  return useMutation({
    mutationFn: ({ endpoint, body, method = 'POST', requestOptions = {} }) => {
      const normalizedMethod = String(method || 'POST').toUpperCase();

      if (normalizedMethod === 'PATCH') {
        return apiService.patch(endpoint, body, requestOptions);
      }

      if (normalizedMethod === 'PUT') {
        return apiService.put(endpoint, body, requestOptions);
      }

      if (normalizedMethod === 'DELETE') {
        return apiService.delete(endpoint, requestOptions);
      }

      return apiService.post(endpoint, body, requestOptions);
    },
    ...options,
  });
}

export default usePost;
