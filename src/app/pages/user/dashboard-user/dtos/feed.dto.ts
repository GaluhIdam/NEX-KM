export interface FeedSourceDTO {
    _source: FeedDTO,
    _index: string
}

export interface FeedDTO {
    uuid: string,
    path: string | undefined,
    pathImage: string | undefined,
    pathCover: string | undefined,
    status: boolean | null | undefined,
    createdAt: string,
    title: string,
    uploadBy: string | null,
    personalNumber: string,
    createdBy: string,
    approvalStatus: string,
    bannedStatus: boolean | null | undefined
}

export interface FeedsTotal {
    value: number
}

export interface QueryParams {
    approvalStatus: string,
    approvalStatusBool: boolean,
    status: boolean,
    bannedStatus: boolean,
}