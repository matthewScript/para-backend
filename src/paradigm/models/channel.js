import {Model}   from 'objection'
import BaseModel from '../../structure/models/base'

export default class Channel extends BaseModel {

  static tableName = 'channels'

  static jsonSchema = BaseModel.extendJsonSchema({
    type: 'object',
    required: ['applicationId', 'desc', 'slug', 'title', 'status', 'resources'],

    properties: {
      applicationId: {type: 'string'},
      desc: {type: 'string'},
      slug: {type: 'string'},
      title: {type: 'string', minLength: 1, maxLength: 255},
      resources: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            categorySlugs: {
              type: 'array',
              items: {type: 'string'}
            },
            limit: {type: 'number'},
            name: {type: 'string'}
          }
        }
      },
    }
  })

  static get relationMappings() {
    const Application = require('../../structure/models/application').default

    return {
      application: {
        relation: Model.BelongsToOneRelation,
        modelClass: Application,
        join: {
          from: 'channels.applicationId',
          to: 'applications.id'
        }
      }
    }
  }

}
