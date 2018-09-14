import {Model} from 'objection'
import BaseModel from '../../structure/models/base'

export default class Document extends BaseModel {

  static tableName = 'documents'

  static jsonSchema = BaseModel.extendJsonSchema({
    type: 'object',
    required: ['applicationId', 'title', 'slug', 'status', 'mode', 'meta'],

    properties: {
      applicationId: {type: 'string'},
      activeRevisionId: {type: 'string'},
      userId: {type: 'string'},
      title: {type: 'string'},
      slug: {type: 'string'},
      status: {
        type: 'string',
        enum: ['draft', 'published', 'scheduled', 'deleted'],
        default: 'draft'
      },
      mode: {
        type: 'string',
        enum: ['article', 'listacle', 'slideshow'],
        default: 'article'
      },
      excerpt: {type: 'string'},
      featuredImageId: {type: 'string'},
      permalink: {type: 'string'},
      timezone: {type: 'string'},
      lastPurgedAt: {type: 'string', format: 'date-time'},
      publishedAt: {type: 'string', format: 'date-time'},
      tags: {
        type: 'array',
        items: {type: 'string'}
      },
      meta: {
        type: 'object',
        properties: {
          desc: {type: 'string'},
          facebookDesc: {type: 'string'},
          facebookImageId: {type: 'string'},
          facebookTitle: {type: 'string'},
          instant: {type: 'boolean'},
          intro: {type: 'string'},
          listType: {type: 'string'},
          title: {type: 'string'},
          twitterDesc: {type: 'string'},
          twitterImageId: {type: 'string'},
          twitterTitle: {type: 'string'}
        }
      }
    }
  })

  static get relationMappings() {
    const DocumentRevision = require('./document-revision').default
    const Category = require('./category').default
    const User = require('../../structure/models/user').default
    const DigitalAsset = require('../../structure/models/digital-asset').default
    const AppleNews = require('./apple-news').default

    return {
      activeRevision: {
        relation: Model.HasOneRelation,
        modelClass: DocumentRevision,
        join: {
          from: 'documents.activeRevisionId',
          to: 'document_revisions.id'
        }
      },
      user: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: 'documents.userId',
          to: 'users.id'
        }
      },
      featuredImage: {
        relation: Model.HasOneRelation,
        modelClass: DigitalAsset,
        join: {
          from: 'documents.featuredImageId',
          to: 'digital_assets.id'
        }
      },
      categories: {
        relation: Model.ManyToManyRelation,
        modelClass: Category,
        join: {
          from: 'documents.id',
          through: {
            from: 'documents_categories.documentId',
            to: 'documents_categories.categoryId'
          },
          to: 'categories.id'
        }
      },
      revisions: {
        relation: Model.HasManyRelation,
        modelClass: DocumentRevision,
        join: {
          from: 'documents.id',
          to: 'document_revisions.documentId'
        }
      },
      appleNews: {
        relation: Model.HasManyRelation,
        modelClass: AppleNews,
        join: {
          from: 'documents.id',
          to: 'apple_news.documentId'
        }
      }
    }
  }

}
