export interface ErrorResponse {
  error: string;
  message?: string;
  detail?: string;
  validationErrors?: Record<string, string>;
}
