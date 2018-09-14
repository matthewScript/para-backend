import {Model} from 'objection'
import uuid from 'uuid/v1'
import * as shortid from 'shortid'

export default class BaseModel extends Model {

  static tableName = 'base'

  static baseJsonSchema = {
    type: 'object',
    required: [],

    properties: {
      id: {type: 'string'},
      sid: {type: 'string'},
      status: {
        type: 'string',
        enum: ['active', 'inactive', 'deleted'],
        default: 'active'
      },
      createdAt: {type: 'string', format: 'date-time'},
      updatedAt: {type: 'string', format: 'date-time'},
    }
  }

  static extendJsonSchema(jsonSchema) {

    const extended = Object.assign({}, this.baseJsonSchema)
    extended.required = extended.required.concat(jsonSchema.required)
    extended.properties = Object.assign({}, extended.properties, jsonSchema.properties)

    return extended

  }

  $beforeInsert() {
    this.id = uuid()
    this.sid = shortid.generate()
    this.createdAt = new Date().toISOString()
  }

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString()
  }

}
