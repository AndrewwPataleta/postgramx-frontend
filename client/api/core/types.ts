export type UUID = string;

export type CurrencyCode = "TON";

export type PaginationRequest = {
  page?: number;
  limit?: number;
  sort?: "recent" | "amount" | "price" | "subscribers";
  order?: "asc" | "desc";
};

export type PaginationResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};
