import BaseModel from '../../structure/models/base'

export default class FacebookInstantArticle extends BaseModel {

  static tableName = 'facebook_ias'

  static jsonSchema = BaseModel.extendJsonSchema({
    type: 'object',
    required: ['articleId', 'articleImportId', 'canonicalUrl', 'markup'],

    properties: {
      articleId: {type: 'string'},
      articleImportId: {type: 'string'},
      canonicalUrl: {type: 'string'},
      importStatus: {
        type: 'string',
        enum: ['success', 'importing', 'failed'],
        default: 'importing'
      },
      markup: {type: 'string'}
    }
  })

}
