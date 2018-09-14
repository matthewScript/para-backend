import BaseModel from '../../structure/models/base'

export default class AdAccount extends BaseModel {

  static tableName = 'ad_accounts'

  static jsonSchema = BaseModel.extendJsonSchema({
    type: 'object',
    required: ['applicationId', 'title', 'facebookAdAccountId'],

    properties: {
      applicationId: {type: 'string'},
      facebookAdAccountId: {type: 'string'},
      facebookCustomConversionId: {type: 'string'},
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
          from: 'ad_accounts.applicationId',
          to: 'applications.id'
        }
      }
    }

  }

}
