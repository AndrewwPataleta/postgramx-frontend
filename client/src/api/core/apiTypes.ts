export type ApiEnvelope<T> = {
  data: T;
  message?: string;
  statusCode?: number;
};
