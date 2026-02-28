import { useCallback } from "react";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/errorHandler";
import { reportToServer } from "../utils/logger";

export function useErrorHandler() {
  const { handleError } = useToast();

  const wrap = useCallback(async (promise, options = {}) => {
    const { 
      onSuccess, 
      onError, 
      successMessage, 
      context = "operation",
      showToast = true,
      reportToServer: shouldReport = true,
    } = options;

    try {
      const result = await promise;
      if (successMessage && showToast) {
        // Import dynamically to avoid circular deps
        const { addToast } = await import("../context/ToastContext").then(m => m.useToast());
        addToast(successMessage, "success");
      }
      onSuccess?.(result);
      return [result, null];
    } catch (error) {
      const errorInfo = getErrorMessage(error);
      
      if (showToast) {
        handleError(error, context);
      }
      
      if (shouldReport && !errorInfo.type.includes("VALIDATION")) {
        await reportToServer(errorInfo.type, errorInfo.message, {
          stack: error?.stack,
          context,
        });
      }
      
      onError?.(error);
      return [null, error];
    }
  }, [handleError]);

  return { wrap, handleError };
}
