import { AxiosError } from "axios";
import { type AxiosErrorResponse } from "./AxiosErrorResponse";

// ✅ Fully typed AxiosError, ensures response and response.data are strongly typed
export type TypedAxiosError = AxiosError<AxiosErrorResponse>;
