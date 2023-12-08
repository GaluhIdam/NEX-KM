import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { EBookReviewDTO } from '../../dtos/nex-library/ebook-review.dto';

export abstract class EBookReviewServiceInterface {
  abstract getEBookReviewData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<EBookReviewDTO[]>>>;

  abstract storeEbookReviewData(
    requestBody: object
  ): Observable<ResponseObjectDTO<EBookReviewDTO>>;
}
