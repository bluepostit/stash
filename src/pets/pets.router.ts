import express, { Request, Response, Router, NextFunction } from 'express'
import { StatusCode } from '../common/http-status-code'
import { DataResponse } from '../common/response-types'

const router: Router = express.Router()

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const response: DataResponse = {
    status: StatusCode.OK,
    data: {
      pets: 'Dog, cat, monkey'
    }
  }
  res.json(response)
})

router.get(/^\/(\d+)$/, (req: Request, _res: Response, next: NextFunction) => {
  next(new Error(`Not implemented yet (id = ${req.params[0]})`))
})

export { router as petsRouter }
