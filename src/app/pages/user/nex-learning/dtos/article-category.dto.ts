export interface ArticleCategoryDTO {
  id: number
  uuid: string
  title: string
  status: boolean
  personalNumber: string
}

export interface CreateArticleCategoryDTO {
  title: string
  status: boolean
  personalNumber: string
}
