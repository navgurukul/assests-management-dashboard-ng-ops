import { useMutation } from '@tanstack/react-query';
import apiService from '@/app/utils/apiService';

function usePut(options = {}) {
  return useMutation({
    mutationFn: ({ endpoint, body }) => apiService.put(endpoint, body),
    ...options,
  });
}

export default usePut;
