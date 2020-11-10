import { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import { Model, Stash } from '../models'

const buildSchema: (i: typeof Model, $id: string) => object
  = (model: typeof Model, $id: string) => {
    const schema = model.jsonSchema
    schema.$id = $id
    return schema
}

const plugin: FastifyPluginCallback = async (fastify, _options, done) => {
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
        oneOf: [{ type: 'object' }, { type: 'null' }],
      },
      children: { type: 'array' },
    },
  })

  fastify.addSchema({
    $id: 'stash',
    type: 'object',
    properties: {
      id: { type: 'number' },
      name: { type: 'string' },
      address: { type: 'string' },
      notes: { type: 'string' },
      user_id: { type: 'number' },
      children: { type: 'array' },
    },
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
        $ref: 'item#',
      },
    },
  }

  fastify.addSchema({
    $id: 'createItem',
    type: 'object',
    definitions: {
      body: createItemBody,
      response: createItemResponse,
    },
  })

  const createStashBody = buildSchema(Stash, '#body')

  const createStashResponse = {
    $id: '#response',
    type: 'object',
    required: ['stash'],
    properties: {
      stash: {
        $ref: 'stash#',
      },
    },
  }

  fastify.addSchema({
    $id: 'createStash',
    type: 'object',
    definitions: {
      body: createStashBody,
      response: createStashResponse,
    },
  })

  fastify.addSchema({
    $id: 'deleteStash',
    type: 'object',
    definitions: {
      querystring: {
        type: 'object',
        properties: {
          withContents: {
            type: 'string',
            enum: ['1'],
          },
        },
      },
    },
  })

  // @ts-ignore
  // fastify.log.error(fastify.getSchemas())
  // @ts-ignore
  // console.log(fastify.getSchema('createItem'))

  done()
}

export default fp(plugin)
