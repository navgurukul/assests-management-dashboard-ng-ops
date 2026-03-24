import { useMutation } from '@tanstack/react-query';
import apiService from '@/app/utils/apiService';

function usePatch(options = {}) {
  return useMutation({
    mutationFn: ({ endpoint, body }) => apiService.patch(endpoint, body),
    ...options,
  });
}

export default usePatch;
