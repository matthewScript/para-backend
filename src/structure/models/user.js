import BaseModel from './base'
import {Model} from 'objection'

export default class User extends BaseModel {

  static tableName = 'users'

  static jsonSchema = BaseModel.extendJsonSchema({
    type: 'object',
    required: ['organizationId', 'username', 'email', 'firstName', 'lastName',
      'imageId', 'slug', 'timezone', 'bio', 'status',
      'hash', 'meta', 'roles'],

    properties: {
      organizationId: {type: 'string'},
      username: {type: 'string', minLength: 1, maxLength: 255},
      firstName: {type: 'string', minLength: 1, maxLength: 30},
      lastName: {type: 'string', minLength: 1, maxLength: 30},
      imageId: {type: 'string'},
      slug: {type: 'string'},
      timezone: {type: 'string'},
      email: {type: 'string'},
      bio: {type: 'string'},
      hash: {type: 'string'},
      meta: {
        type: 'object',
        properties: {
          facebook: {type: 'string'},
          twitter: {type: 'string'}
        }
      },
      roles: {
        type: 'object',
        properties: {
          applications: {type: 'object'},
          organizations: {type: 'object'}
        }
      }
    }
  })

  static get relationMappings() {
    const Document = require('../../paradigm/models/document').default

    return {
      documents: {
        relation: Model.HasManyRelation,
        modelClass: Document,
        join: {
          from: 'users.id',
          to: 'documents.userId'
        }
      }
    }
  }

}
