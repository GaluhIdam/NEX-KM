import { FeedSourceDTO, FeedsTotal } from "src/app/pages/user/dashboard-user/dtos/feed.dto"

export interface ResponseArrayDTO<T> {
  message: string
  status: number
  data: DataDTO<T>
}

export interface DataDTO<T> {
  data: T,
  length: number,
  result: T,
  total: number
}

export interface ResponseObjectDTO<T> {
  message: string
  status: number
  data: T
}

export interface ResponseFeedsDTO extends Partial<ResponseObjectDTO<{ hits: FeedSourceDTO[], total: FeedsTotal }>> { }
