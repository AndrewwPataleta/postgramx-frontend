export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: unknown;
}

export type ApiResult<T> = {
  data: T;
  message?: string;
};
