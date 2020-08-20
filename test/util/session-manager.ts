import supertest from 'supertest'
import { FastifyInstance } from 'fastify'
import { TestUser } from './record-manager'

const LOGIN_PATH = '/login'

interface SessionManagerInterface {
  loginAsUser(
    app: FastifyInstance,
    user: TestUser
  ): Promise<supertest.SuperAgentTest>
}

const SessionManager: SessionManagerInterface = class {
  static async loginAsUser(
    app: FastifyInstance,
    user: TestUser
  ): Promise<supertest.SuperAgentTest> {
    const agent = supertest.agent(app.server)
    const res = await agent.post(LOGIN_PATH).send({
      username: user.email,
      password: user.unencryptedPassword,
    })
    if (!(res.body.message as string).match(/success/i)) {
      throw new Error('Login to server failed!')
    }
    return agent
  }
}

export default SessionManager
