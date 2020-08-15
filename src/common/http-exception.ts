import { StatusCode } from './http-status-code'

export default class HttpException extends Error {
  statusCode: StatusCode
  message: string
  error: string | null

  constructor(statusCode: StatusCode, message: string, error?: string) {
    super(message)

    this.statusCode = statusCode
    this.message = message
    this.error = error || null
  }
}
