import {Model} from 'objection'
import BaseModel from '../../structure/models/base'

export default class AppleNews extends BaseModel {

  static tableName = 'apple_news'

  static jsonSchema = BaseModel.extendJsonSchema({
    type: 'object',
    required: ['articleId', 'articleJson', 'articleRevision', 'documentId', 'status'],

    properties: {
      articleId: {type: 'string'},
      articleJson: {type: 'object'},
      articleRevision: {type: 'string'},
      documentId: {type: 'string'}
    }
  })

  static get relationMappings() {
    const Document = require('./document').default

    return {
      document: {
        relation: Model.BelongsToOneRelation,
        modelClass: Document,
        join: {
          from: 'apple_news.documentId',
          to: 'documents.id'
        }
      }
    }
  }

}
