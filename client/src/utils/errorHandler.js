/**
 * Error Handler Utility
 * Provides standardized error messages and handling
 */

export const ERROR_MESSAGES = {
  NETWORK: "Network error. Please check your connection.",
  TIMEOUT: "Request timed out. Please try again.",
  NOT_FOUND: "Data not found.",
  UNAUTHORIZED: "You don't have permission to access this.",
  SERVER_ERROR: "Server error. Please try again later.",
  UNKNOWN: "Something went wrong. Please try again.",
};

export const ERROR_TYPES = {
  NETWORK: "NETWORK",
  TIMEOUT: "TIMEOUT",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  SERVER_ERROR: "SERVER_ERROR",
  VALIDATION: "VALIDATION",
  UNKNOWN: "UNKNOWN",
};

/**
 * Determine error type and message from error object
 */
export function getErrorMessage(error) {
  // Network error
  if (!navigator.onLine || error?.message === "Failed to fetch") {
    return {
      type: ERROR_TYPES.NETWORK,
      message: ERROR_MESSAGES.NETWORK,
    };
  }

  // Timeout
  if (error?.name === "AbortError") {
    return {
      type: ERROR_TYPES.TIMEOUT,
      message: ERROR_MESSAGES.TIMEOUT,
    };
  }

  // HTTP status codes
  if (error?.status) {
    if (error.status === 404) {
      return {
        type: ERROR_TYPES.NOT_FOUND,
        message: ERROR_MESSAGES.NOT_FOUND,
      };
    }
    if (error.status === 401 || error.status === 403) {
      return {
        type: ERROR_TYPES.UNAUTHORIZED,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      };
    }
    if (error.status >= 500) {
      return {
        type: ERROR_TYPES.SERVER_ERROR,
        message: ERROR_MESSAGES.SERVER_ERROR,
      };
    }
  }

  // Fallback
  return {
    type: ERROR_TYPES.UNKNOWN,
    message: error?.message || ERROR_MESSAGES.UNKNOWN,
  };
}

/**
 * Wrap API calls with timeout and error handling
 */
export async function fetchWithTimeout(fetchFn, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await fetchFn();
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Retry logic for failed requests
 */
export async function retryWithBackoff(
  fetchFn,
  maxRetries = 3,
  delayMs = 1000,
) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed, retrying...`, error);

      // Don't retry on 4xx errors (client error)
      if (error?.status >= 400 && error?.status < 500) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)),
        );
      }
    }
  }

  throw lastError;
}
