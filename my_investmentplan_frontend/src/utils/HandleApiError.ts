
import type { TypedAxiosError } from "../Types/ApiError";

export const handleApiError = (err: unknown, fallbackMessage: string): never => {
  const error = err as TypedAxiosError;

  const message =
    error?.response?.data?.Exception ||
    error?.response?.data?.message ||
    fallbackMessage;

  throw new Error(message);
};
