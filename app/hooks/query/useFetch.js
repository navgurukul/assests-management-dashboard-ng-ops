import { useQuery } from "@tanstack/react-query";
import get from "@/app/api/get/get";


function useFetch({
    url,
    queryKey,
    enabled = true,
    contentType,
}){
    return useQuery({
        queryKey,
        queryFn: ({ signal }) => get({ url, contentType, signal }),
        enabled,
        retry:4,
        refetchOnWindowFocus: false,
    });
}

export default useFetch;