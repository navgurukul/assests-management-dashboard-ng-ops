import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import get from '@/app/api/get/get';
import config from '@/app/config/env.config';

const buildPagedUrl = (baseUrl, dependsOn, dependentValue, additionalParams, searchTerm, page, limit) => {
  let finalUrl = baseUrl;
  const queryParams = [];

  if (dependsOn && dependentValue) {
    if (baseUrl.endsWith('/')) {
      finalUrl = `${baseUrl}${dependentValue}`;
    } else {
      queryParams.push(`${dependsOn.paramKey}=${dependentValue}`);
    }
  }

  if (additionalParams) {
    Object.entries(additionalParams).forEach(([paramKey, paramValue]) => {
      if (paramValue != null && paramValue !== '') {
        queryParams.push(`${paramKey}=${paramValue}`);
      }
    });
  }

  if (searchTerm) {
    queryParams.push(`search=${encodeURIComponent(searchTerm)}`);
  }

  queryParams.push(`page=${page}`);
  queryParams.push(`limit=${limit}`);

  if (queryParams.length > 0) {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${separator}${queryParams.join('&')}`;
  }

  return finalUrl;
};

export const useInfiniteApiAutocomplete = ({
  apiUrl,
  queryKey,
  dependsOn,
  dependentValue,
  additionalParams,
  filterFn,
  searchTerm,
  limit = 10,
  enabled = true,
}) => {
  const shouldFetch = enabled && !!apiUrl && (!dependsOn || !!dependentValue);

  const fullBaseUrl = useMemo(() => {
    if (!apiUrl) return null;
    return apiUrl.startsWith('http') ? apiUrl : config.getApiUrl(apiUrl);
  }, [apiUrl]);

  const finalQueryKey = useMemo(() => {
    const baseKey = queryKey ? [...queryKey, 'paginated'] : ['paginated-autocomplete', apiUrl];
    return [...baseKey, dependentValue, additionalParams, searchTerm];
  }, [queryKey, apiUrl, dependentValue, additionalParams, searchTerm]);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: finalQueryKey,
    queryFn: ({ pageParam, signal }) => {
      const pagedUrl = buildPagedUrl(
        fullBaseUrl,
        dependsOn,
        dependentValue,
        additionalParams,
        searchTerm,
        pageParam,
        limit,
      );
      return get({ url: pagedUrl, signal });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.pagination;
      if (!pagination) return undefined;
      const { page, totalPages } = pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const items = useMemo(() => {
    if (!data?.pages) return [];

    let allItems = data.pages.flatMap((page) => {
      if (Array.isArray(page)) return page;
      if (Array.isArray(page?.data)) return page.data;
      return [];
    });

    if (filterFn && typeof filterFn === 'function') {
      allItems = allItems.filter(filterFn);
    }

    return allItems;
  }, [data, filterFn]);

  return {
    items,
    isLoading,
    isFetchingNextPage,
    hasNextPage: !!hasNextPage,
    fetchNextPage,
  };
};