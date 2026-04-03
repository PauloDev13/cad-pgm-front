import { Observable } from 'rxjs';
import { PageResponse } from './pagination.model';

export interface ICrudGeneric<T> {
  findAll(page: number, size: number): Observable<PageResponse<T[]>>;

  searchFilter(page: number, size: number, filter: string): Observable<PageResponse<T[]>>;

  create(payload: T): Observable<any>;

  update(id: number, payload: any): Observable<any>;

  delete(id: number): Observable<any>;
}
