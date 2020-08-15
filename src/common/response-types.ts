import { StatusCode } from "./http-status-code";

interface ErrorResponse {
  error: string,
  status: StatusCode,
  message?: string
}

interface DataResponse {
  status: StatusCode,
  data: object
}

export { ErrorResponse, DataResponse }
