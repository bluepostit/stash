import { Request, Response, NextFunction } from 'express'
import { ErrorResponse } from '../common/response-types'
import { StatusCode } from '../common/http-status-code'

export const notFoundHandler = (
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  const json: ErrorResponse = {
    status: StatusCode.NOT_FOUND,
    error: 'Resource not found'
  }
  response.json(json)
}
