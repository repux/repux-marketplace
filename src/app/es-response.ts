export class EsResponse<T> {
  total: number;
  max_score: number;
  hits: T[];
}
