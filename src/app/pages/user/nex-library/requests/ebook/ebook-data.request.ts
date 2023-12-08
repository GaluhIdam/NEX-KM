import { EBookFilterRequest } from './ebook-filter.request';

export interface EBookDataRequest {
  filter?: EBookFilterRequest;
  order?: object;
  limit?: number;
  offset?: number;
  page?: number;
}
