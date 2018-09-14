import chai from "chai"
import chaiHttp from "chai-http"
import server from "../src/app"
import {
  migrateUp,
  migrateDown,
  getRandomOrgPayload,
  getRandomAppPayload,
  getRandomUserPayload,
  getRandomDocumentPayload,
  getRandomAppleNewsPayload,
  getRandomDastPayload,
  getRandomCatPayload,
  getRandomDocumentRevisionPayload
} from "./helpers"

const expect = chai.expect
chai.use(chaiHttp)

describe("apple-news", function() {

  beforeEach(async function() {
    await migrateUp()
  })

  afterEach(async function() {
    await migrateDown()
  })

  // Failure creating with invalidData
  it('should fail to create an Apple News element on invalid data', async function() {
    const response = await chai
      .request(server)
      .post('/apple-news')
      .send({})
    expect(response.status).to.equal(400)
  })


  // Failure deleting non-existing element
  it('should fail deleting a non-existing Apple News element ', async function() {
    const response = await chai
      .request(server)
      .delete(`/apple-news/badId`)

    expect(response.status).to.equal(404)
  })

  // Failure with a bad Document Id
  it('should fail creating an Apple-News element with a bad documentId ', async function() {
    const response = await chai
      .request(server)
      .post('/apple-news')
      .send(getRandomAppleNewsPayload("badId"))
    expect(response.status).to.equal(400)
  })

  // Special suite with different timeout and preliminary requests
  describe("apple-news that require documents", function () {
    this.timeout(5000)

    beforeEach(async function() {
      const organization = await chai
        .request(server)
        .post("/organizations")
        .send(getRandomOrgPayload())

      const application = await chai
        .request(server)
        .post("/applications")
        .send(getRandomAppPayload(organization.body.id))

      const user = await chai
        .request(server)
        .post("/users")
        .send(getRandomUserPayload(organization.body.id, application.body.id))

      const category = await chai.request(server)
        .post('/categories')
        .send(getRandomCatPayload(application.body.id))

      const digitalAsset = await chai.request(server)
        .post('/digital-assets')
        .send(getRandomDastPayload(application.body.id))

      const documentPayload = getRandomDocumentPayload(
        application.body.id,
        user.body.id,
        digitalAsset.body.id,
        [category.body.id]
      )

      const document = await chai
        .request(server)
        .post("/documents")
        .send(
          documentPayload
        )

      const revision = await chai.request(server)
        .post('/document-revisions')
        .send(getRandomDocumentRevisionPayload(document.body.id))

      const patchedDocument = await chai.request(server)
        .patch(`/documents/${document.body.id}`)
        .send({
          ...documentPayload,
          activeRevisionId: revision.body.id
        })

      this.document = patchedDocument.body
    })

    // Create
    it("should create an Apple News element", async function() {
      const appleNewsPayload = getRandomAppleNewsPayload(this.document.id)

      const response = await chai
        .request(server)
        .post('/apple-news')
        .send(appleNewsPayload)

      const {body} = response

      // Status
      expect(response.status).to.equal(200)

      // Properties
      expect(body.id).to.be.string
      expect(body.sid).to.be.string
      expect(body.status).to.equal(appleNewsPayload.status)
      expect(body.articleId).to.equal(appleNewsPayload.articleId)
      expect(body.articleJson).to.be.deep.equal(appleNewsPayload.articleJson)
      expect(body.articleRevision).to.equal(appleNewsPayload.articleRevision)
      expect(body.createdAt).to.be.string
    })

    // Delete
    it('should delete an Apple News element', async function() {
      const appleNewsPayload = getRandomAppleNewsPayload(this.document.id)

      const appleNews = await chai
        .request(server)
        .post('/apple-news')
        .send(appleNewsPayload)

      const response = await chai
        .request(server)
        .delete(`/apple-news/${appleNews.body.id}`)

      expect(response.status).to.equal(200)
    })

    // Get
    it('should get a single Apple News element', async function() {
      const createdAppleNews = await chai
        .request(server)
        .post('/apple-news')
        .send(getRandomAppleNewsPayload(this.document.id))

      const readAppleNews = await chai
        .request(server)
        .get(`/apple-news/${createdAppleNews.body.id}`)

      // Status
      expect(readAppleNews.status).to.equal(200)

      delete readAppleNews.body[0].updatedAt
      // Properties
      expect(readAppleNews.body[0]).to.be.deep.equal(createdAppleNews.body)
    })

    // Get Apple-news related to a document
    it('should get all news related to a document', async function() {
      const appleNews = await chai
        .request(server)
        .post('/apple-news')
        .send(getRandomAppleNewsPayload(this.document.id))

      const appleNews2 = await chai
        .request(server)
        .post('/apple-news')
        .send(getRandomAppleNewsPayload(this.document.id))

      const response = await chai
        .request(server)
        .get(`/documents/${this.document.id}/apple-news`)

      expect(response.status).to.equal(200)
      expect(response.body.length).to.equal(2)

      expect(response.body[0].id).to.equal(appleNews.body.id)
      expect(response.body[1].id).to.equal(appleNews2.body.id)

      expect(response.body[0].document.id).to.be.equal(this.document.id)
      expect(response.body[1].document.id).to.be.equal(this.document.id)
    })

    // Get all appleNews
    it('should get all Apple News sorted by creation date', async function() {
      const appleNews = await chai
        .request(server)
        .post('/apple-news')
        .send(getRandomAppleNewsPayload(this.document.id))

      const appleNews2 = await chai
        .request(server)
        .post('/apple-news')
        .send(getRandomAppleNewsPayload(this.document.id))

      const response = await chai
        .request(server)
        .get(`/apple-news`)

      expect(response.status).to.equal(200)
      expect(response.body.length).to.equal(2)
      expect(response.body[0].id).to.equal(appleNews.body.id)
      expect(response.body[1].id).to.equal(appleNews2.body.id)

      const date1 = Date.parse(response.body[0].createdAt)
      const date2 = Date.parse(response.body[1].createdAt)

      expect(date1).to.be.below(date2)
    })

  })

  // End Special Tests

})
