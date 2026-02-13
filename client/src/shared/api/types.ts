export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ApiSuccessResponse<T> = {
  ok: true;
  data: T;
};
