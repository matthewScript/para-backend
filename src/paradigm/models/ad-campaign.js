
import BaseModel from '../../structure/models/base'

export default class AdCampaign extends BaseModel {

  static tableName = 'ad_campaigns'

  static jsonSchema = BaseModel.extendJsonSchema({
    type: 'object',
    required: ['adAccountId', 'applicationId', 'digitalAssetIds', 'headlines', 'platforms', 'link', 'texts', 'title'],

    properties: {
      activation: {type: 'string',
        enum: ['finished', 'progress', 'error'],
      },
      adAccountId: {type: 'string'},
      applicationId: {type: 'string'},
      clone: {type: 'boolean', default: false},
      digitalAssetIds: {
        type: "array",
        items: {type: "string"}
      },
      fbAdCampaignConfigs: {
        type: "array",
        items: {type: "string"}
      },
      headlines: {
        type: "array",
        items: {type: "string"}
      },
      inProgressDate: {type: 'string', format: 'date-time'},
      platforms: {type: 'string',
        enum: ['twitter', 'facebook'],
        default: 'twitter'
      },
      link: {type: 'string'},
      texts: {
        type: "array",
        items: {type: "string"}
      },
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
          from: 'ad_campaigns.applicationId',
          to: 'applications.id'
        }
      }
    }

  }

}
