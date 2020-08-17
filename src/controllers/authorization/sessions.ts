import express, { Request, Response, NextFunction, Router } from "express";
import passport from 'passport'

export class SessionsController {
  constructor(protected router: Router) {
    router.post('/', this.create)
  }

  async create() {
    return async function (_req: Request, _res: Response, _next: NextFunction) {
      console.log('hi there')
      _next()
    }
  }
}

const sessionsRouter = express.Router()
// new SessionsController(sessionsRouter)

sessionsRouter.post('/', passport.authenticate('local'), async (_req, _res, _next) => {
  _res.send('hi there')
})

export default sessionsRouter
