import BaseModel from './base'
import {Model} from 'objection'

export default class Organization extends BaseModel {

  static tableName = 'organizations'

  static jsonSchema = BaseModel.extendJsonSchema({
    type: 'object',
    required: ['title', 'desc', 'status', 'meta'],

    properties: {
      title: {type: 'string'},
      desc: {type: 'string'},
      meta: {
        type: 'object',
        properties: {
          imageId: {type: 'string'},
          timezone: {type: 'string'}
        }
      }
    }
  })

  static get relationMappings() {
    const Application = require('./application').default

    return {
      applications: {
        relation: Model.HasManyRelation,
        modelClass: Application,
        join: {
          from: 'organizations.id',
          to: 'applications.organizationId'
        }
      }
    }
  }

}
