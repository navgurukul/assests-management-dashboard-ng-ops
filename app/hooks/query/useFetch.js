import { useQuery } from "@tanstack/react-query";
import get from "@/app/api/get/get";
import config from "@/app/config/env.config";


function useFetch({
    url,
    queryKey,
    enabled = true,
    contentType,
}){
    // If url is relative, prepend API base URL
    const fullUrl = url.startsWith('http') ? url : config.getApiUrl(url);
    
    return useQuery({
        queryKey,
        queryFn: ({ signal }) => get({ url: fullUrl, contentType, signal }),
        enabled,
        retry:4,
        refetchOnWindowFocus: false,
    });
}

export default useFetch;