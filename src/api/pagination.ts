/** The { data, page, perPage, lastPage, total } envelope every list endpoint returns (verified on GET /patients). */
export interface RawPaginatedList<T> {
  data: T[];
  page: number;
  perPage: number;
  lastPage: number;
  total: number;
}

export interface PaginatedList<T> {
  items: T[];
  page: number;
  perPage: number;
  lastPage: number;
  total: number;
}

/** Unwraps a paginated list response, mapping each raw item through `mapItem`. */
export function unwrapList<Raw, Mapped>(
  raw: RawPaginatedList<Raw>,
  mapItem: (raw: Raw) => Mapped
): PaginatedList<Mapped> {
  return {
    items: raw.data.map(mapItem),
    page: raw.page,
    perPage: raw.perPage,
    lastPage: raw.lastPage,
    total: raw.total,
  };
}
