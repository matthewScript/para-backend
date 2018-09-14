import BaseModel from './base'

export default class DigitalAsset extends BaseModel {

  static tableName = 'digital_assets'

  static jsonSchema = BaseModel.extendJsonSchema({
    type: 'object',
    required: ['applicationId', 'mimetype', 'status', 'attribution', 'meta'],

    properties: {
      applicationId: {type: 'string'},
      title: {type: 'string'},
      desc: {type: 'string'},
      mimetype: {type: 'string'},
      attribution: {type: 'boolean', default: false},
      html: {type: 'string'},
      filename: {type: 'string'},
      url: {type: 'string'},
      tags: {
        type: 'array',
        items: {type: 'string'}
      },
      meta: {
        type: 'object',
        properties: {
          author_name: {type: 'string'},
          author_url: {type: 'string'},
          caption: {type: 'string'},
          bucket: {type: 'string'},
          encoding: {type: 'string'},
          extension: {type: 'string'},
          cache_age: {type: 'number'},
          width: {type: 'number'},
          height: {type: 'number'},
          originalEmbedUrl: {type: 'string'},
          originalFileUrl: {type: 'string'},
          provider_name: {type: 'string'},
          size: {type: 'number'},
          crop: {
            type: 'object',
            properties: {
              aspect: {type: 'number'},
              width: {type: 'number'},
              x: {type: 'number'},
              y: {type: 'number'},
            }
          },
          customWidth: {type: 'number'},
          customHeight: {type: 'number'},
          provider_url: {type: 'string'},
          state: {type: 'string',
            enum: ['processing', 'ready'],
            default: 'ready'},
          type: {type: 'string'}
        }
      }
    }
  })

  // this is just for sqlite, as sqlite stores boolean data into 0/1
  $parseDatabaseJson(db) {
    let json = super.$parseDatabaseJson(db)
    json.attribution = (json.attribution === 1) ? true : false
    return json
  }

}
