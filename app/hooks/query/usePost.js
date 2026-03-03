import { useMutation } from '@tanstack/react-query';
import apiService from '@/app/utils/apiService';

function usePost(options = {}) {
  return useMutation({
    mutationFn: ({ endpoint, body }) => apiService.post(endpoint, body),
    ...options,
  });
}

export default usePost;
