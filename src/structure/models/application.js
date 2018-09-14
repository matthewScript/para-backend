import {Model} from 'objection'
import BaseModel from './base'

export default class Application extends BaseModel {

  static tableName = 'applications'

  static jsonSchema = BaseModel.extendJsonSchema({
    type: 'object',
    required: ['organizationId', 'title', 'status', 'meta'],

    properties: {
      organizationId: {type: 'string'},
      title: {type: 'string', minLength: 1, maxLength: 255},
      meta: {
        type: 'object',
        properties: {
          attributionRequired: {type: 'boolean'},
          primaryColor: {type: 'string'},
          social: {
            type: 'object',
            properties: {
              appleNews: {
                type: 'object',
                properties: {
                  apiId: {type: 'string'},
                  apiSecret: {type: 'string'},
                  channelId: {type: 'string'}
                }
              },
              facebook: {
                type: 'object',
                properties: {
                  accessToken: {type: 'string'},
                  appId: {type: 'string'},
                  appSecret: {type: 'string'},
                  fbiaPath: {type: 'string'},
                  pageAccessToken: {type: 'string'},
                  pageId: {type: 'string'},
                  pixelId: {type: 'string'}
                }
              }
            }
          },
          cdn: {
            type: 'object',
            properties: {
              cacheKeys: {
                type: 'object',
                properties: {
                  channelAPI: {type: 'string'},
                }
              },
              services: {
                type: 'object',
                properties: {
                  media: {
                    type: 'object',
                    properties: {
                      hostname: {type: 'string'},
                    }
                  },
                  site: {
                    type: 'object',
                    properties: {
                      hostname: {type: 'string'}
                    }
                  }
                }
              }
            }
          },
          env: {
            type: 'object',
            properties: {
              production: {
                type: 'object',
                properties: {
                  host: {type: 'string'},
                  hostPreview: {type: 'string'},
                  protocol: {type: 'string'},
                }
              },
              staging: {
                type: 'object',
                properties: {
                  host: {type: 'string'},
                  hostPreview: {type: 'string'},
                  protocol: {type: 'string'},
                }
              }
            }
          }
        }
      }
    }
  })

  static get relationMappings() {
    const Organization = require('./organization').default
    const Channel = require('../../paradigm/models/channel').default

    return {
      organization: {
        relation: Model.BelongsToOneRelation,
        modelClass: Organization,
        join: {
          from: 'applications.organizationId',
          to: 'organizations.id'
        }
      },
      channels: {
        relation: Model.HasManyRelation,
        modelClass: Channel,
        join: {
          from: 'applications.id',
          to: 'channels.applicationId'
        }
      }
    }
  }

}
