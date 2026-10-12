export interface BaseResponse {
  Count: number,
  Message: string,
  SearchCriteria: string,
}

export interface ResponseFromXML {
  Response: BaseResponse;
}
