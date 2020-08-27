import { FastifyPlugin } from 'fastify'
import fp from 'fastify-plugin'

const plugin: FastifyPlugin = async (fastify, _options, done) => {
  fastify.addSchema({
    $id: 'messageResponse',
    type: 'object',
    required: ['message'],
    properties: {
      message: { type: 'string' },
    },
  })

  fastify.addSchema({
    $id: 'item',
    type: 'object',
    properties: {
      id: { type: 'number' },
      name: { type: 'string' },
      description: { type: 'string' },
      user_id: { type: 'number' },
      parent: {
        oneOf: [
          { type: 'object' },
          { type: 'null' }
        ]
      },
      children: { type: 'array' }
    }
  })

  fastify.addSchema({
    $id: 'signUpRequestBody',
    type: 'object',
    required: ['username', 'password', 'password2'],
    properties: {
      username: {
        type: 'string',
        format: 'email',
        minLength: 6,
        maxLength: 120,
      },
      password: {
        type: 'string',
        minLength: 6,
      },
      password2: {
        const: { $data: '1/password' },
        errorMessage: {
          const: 'Passwords must match',
        },
      },
    },
  })

  fastify.addSchema({
    $id: 'loginRequestBody',
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: {
        type: 'string',
      },
      password: {
        type: 'string',
      },
    },
  })

  const createItemBody = {
    $id: '#body',
    type: 'object',
    required: ['name', 'description'],
    properties: {
      name: {
        type: 'string',
        minLength: 6,
      },
      description: {
        type: 'string',
        minLength: 6,
      },
    },
  }

  const createItemResponse = {
    $id: '#response',
    type: 'object',
    required: ['item'],
    properties: {
      item: {
        $ref: 'item#'
      },
    },
  }

  fastify.addSchema({
    $id: 'createItem',
    type: 'object',
    definitions: {
      body: createItemBody,
      response: createItemResponse
    },
  })

  done()
}

export default fp(plugin)
