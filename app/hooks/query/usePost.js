import { useMutation } from '@tanstack/react-query';
import apiService from '@/app/utils/apiService';

function usePost(options = {}) {
  return useMutation({
    mutationFn: ({ endpoint, body, requestOptions = {} }) => {
      return apiService.post(endpoint, body, requestOptions);
    },
    ...options,
  });
}

export default usePost;
