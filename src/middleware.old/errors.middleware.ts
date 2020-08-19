import HttpException from '../common/http-exception'
import { Request, Response, NextFunction } from 'express'
import { StatusCode } from '../common/http-status-code'
import { ErrorResponse } from '../common/response-types'

export const errorHandler = (
  error: HttpException,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  const status = error.statusCode || StatusCode.INTERNAL_SERVER_ERROR
  const message = error.message
    || "We encountered a problem"

  const responseJson: ErrorResponse = {
    status,
    error: message
  }

  response.status(status).json(responseJson)
}
