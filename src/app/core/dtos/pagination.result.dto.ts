export interface PaginationResultDTO<T> {
  count: number;
  currentPage: number;
  nextPage?: number | null;
  prevPage?: number | null;
  totalPages?: number;
  lastPage?: number;
  data: T[]
}