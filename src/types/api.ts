export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Error body shape. Covers FastAPI (`detail` as string or validation array)
 * and the common `{ message }` convention. Adjust to match your backend.
 */
export interface ApiErrorResponse {
  detail?: string | { msg: string; loc?: (string | number)[] }[];
  message?: string;
}
