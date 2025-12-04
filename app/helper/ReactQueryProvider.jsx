'use client';

import { useState } from "react";
import { onErrorHelper } from "../config/config";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: (failureCount, error) => {
            // Treat 5xx status or code >= 500 as server errors
            const isServerError = (error && (error.status >= 500 || error.code >= 500));

            // Retry up to 3 times for server errors
            if (isServerError) {
              return failureCount < 3;
            }

            // Do not retry for client or other errors
            return false;
          },
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000) // Exponential backoff
        },
        mutations: {
          retry: (failureCount, error) => {
            const isServerError = (error && (error.status >= 500 || error.code >= 500));
            if (isServerError) {
              return failureCount < 3;
            }
            return false;
          },
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
        }
      }
    });

queryClient.getQueryCache().subscribe((event) => {
      if (event && event.action && event.action.type === "error") {
        const err = event.action.error;
        if (err && err.errors) {
          onErrorHelper(err);
        }
      }
    });

const ReactQueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} position="top" />
      {children}
    </QueryClientProvider>
  );
};

export default ReactQueryProvider;