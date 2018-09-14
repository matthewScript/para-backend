import BaseModel from '../../structure/models/base'

export default class DocumentRevision extends BaseModel {

    static tableName = 'document_revisions'

    static jsonSchema = BaseModel.extendJsonSchema({
      type: 'object',
      required: ['documentId', 'cards'],

      properties: {
        documentId: {type: 'string'},
        cards: {
          type: 'array',
          items: {type: 'object'}
        }
      }
    })

}
