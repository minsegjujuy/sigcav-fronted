export type SortDirection = 'asc' | 'desc';

export interface SortItem {
  field: string;
  direction: SortDirection;
}