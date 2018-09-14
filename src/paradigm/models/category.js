import BaseModel from '../../structure/models/base'

export default class Category extends BaseModel {

  static tableName = 'categories'

  static jsonSchema = BaseModel.extendJsonSchema({
    type: 'object',
    required: ['applicationId', 'slug', 'title'],

    properties: {
      applicationId: {type: 'string'},
      meta: {
        type: 'object',
        properties: {
          customHeading: {type: 'string'},
          customHtml: {type: 'string'},
          isCustom: {type: 'boolean'},
        },
      },
      slug: {type: 'string'},
      title: {type: 'string'},
    }
  })

  static get relationMappings() {
    const Application = require('../../structure/models/application').default

    return {
      application: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Application,
        join: {
          from: 'categories.applicationId',
          to: 'applications.id'
        }
      }
    }
  }
}
