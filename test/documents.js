import chai from 'chai'
import chaiHttp from 'chai-http'
import server from '../src/app'
import {migrateUp, migrateDown,
  getRandomOrgPayload, getRandomAppPayload,
  getRandomUserPayload, getRandomCatPayload,
  getRandomDocumentPayload, getRandomDastPayload,
  getRandomDocumentRevisionPayload} from './helpers'


const expect = chai.expect
chai.use(chaiHttp)


async function insertDocument(orgId, appId, userId, categoryId, status, title) {

  let appRes, userRes, categoryRes

  if (!orgId) {
    const orgPayload = getRandomOrgPayload()
    const orgRes = await chai.request(server)
      .post('/organizations')
      .send(orgPayload)

    orgId = orgRes.body.id
  }

  if (!appId) {
    const appPayload = getRandomAppPayload(orgId)
    appRes = await chai.request(server)
      .post('/applications')
      .send(appPayload)

    appId = appRes.body.id
  }

  if (!userId) {
    const userPayload = getRandomUserPayload(orgId, appId)
    userRes = await chai.request(server)
      .post('/users')
      .send(userPayload)

    userId = userRes.body.id
  }

  if (!categoryId) {
    const categoryPayload = getRandomCatPayload(appId)
    categoryRes = await chai.request(server)
      .post('/categories')
      .send(categoryPayload)

    categoryId = categoryRes.body.id
  }

  const dastPayload = getRandomDastPayload(appId)
  const digitalAssetRes = await chai.request(server)
    .post('/digital-assets')
    .send(dastPayload)

  const documentPayload = getRandomDocumentPayload(
    appId,
    userId,
    digitalAssetRes.body.id,
    [categoryId],
    status,
    title
  )

  let documentRes = await chai.request(server)
    .post('/documents')
    .send(documentPayload)

  const revisionPayload = getRandomDocumentRevisionPayload(documentRes.body.id)
  const revisionRes = await chai.request(server)
    .post('/document-revisions')
    .send(revisionPayload)

  documentPayload.activeRevisionId = revisionRes.body.id

  documentRes = await chai.request(server)
    .patch(`/documents/${documentRes.body.id}`)
    .send(documentPayload)

  return {
    documentRes,
    revisionRes,
    userRes,
    appRes,
    digitalAssetRes,
    categoryRes,
    documentPayload
  }

}


function checkDocumentResult (documentRes, revisionRes, userRes, digitalAssetRes, categoryRes, documentPayload) {

  expect(documentRes.body.id).to.be.a.string
  expect(documentRes.body.sid).to.be.a.string
  expect(documentRes.body.applicationId).to.equal(documentPayload.applicationId)
  expect(documentRes.body.activeRevisionId).to.equal(documentPayload.activeRevisionId)
  expect(documentRes.body.userId).to.equal(documentPayload.userId)
  expect(documentRes.body.title).to.equal(documentPayload.title)
  expect(documentRes.body.slug).to.equal(documentPayload.slug)
  expect(documentRes.body.status).to.equal(documentPayload.status)
  expect(documentRes.body.mode).to.equal(documentPayload.mode)
  expect(documentRes.body.excerpt).to.equal(documentPayload.excerpt)
  expect(documentRes.body.permalink).to.equal(documentPayload.permalink)
  expect(documentRes.body.timezone).to.equal(documentPayload.timezone)
  expect(documentRes.body.lastPurgedAt).to.equal(documentPayload.lastPurgedAt)
  expect(documentRes.body.publishedAt).to.equal(documentPayload.publishedAt)
  expect(documentRes.body.tags).to.deep.equal(documentPayload.tags)
  expect(documentRes.body.meta).to.deep.equal(documentPayload.meta)

  // relation checking
  expect(documentRes.body.activeRevision).to.be.an('object')
  expect(documentRes.body.activeRevision.cards).to.deep.equal(revisionRes.body.cards)
  expect(documentRes.body.user).to.be.an('object')
  expect(documentRes.body.user.slug).to.equal(userRes.body.slug)
  expect(documentRes.body.user.roles).to.deep.equal(userRes.body.roles)
  expect(documentRes.body.user.meta).to.deep.equal(userRes.body.meta)
  expect(documentRes.body.featuredImage).to.be.an('object')
  expect(documentRes.body.featuredImage.title).to.deep.equal(digitalAssetRes.body.title)
  expect(documentRes.body.featuredImage.tags).to.deep.equal(digitalAssetRes.body.tags)
  expect(documentRes.body.featuredImage.meta).to.deep.equal(digitalAssetRes.body.meta)

  // checking eagerloaded categories
  expect(documentRes.body.categories[0]).to.be.an('object')
  expect(documentRes.body.categories[0].slug).to.equal(categoryRes.body.slug)
  expect(documentRes.body.categories[0].meta).to.deep.equal(categoryRes.body.meta)

}


describe('documents', function() {

  beforeEach(async function () {
    await migrateUp()
  })

  afterEach(async function() {
    await migrateDown()
  })

  it('should create a document', async function() {

    const {
      documentRes,
      revisionRes,
      userRes,
      digitalAssetRes,
      categoryRes,
      documentPayload
    } = await insertDocument()

    expect(documentRes.status).to.equal(200)
    checkDocumentResult(documentRes, revisionRes, userRes, digitalAssetRes, categoryRes, documentPayload)

  })

  it('should 404 when deleting non-existing document', async function() {

    const res = await chai.request(server)
      .delete(`/documents/badid`)

    expect(res.status).to.equal(404)

  })

  it('should get a single document', async function() {

    const {
      documentRes,
      revisionRes,
      userRes,
      digitalAssetRes,
      categoryRes,
      documentPayload
    } = await insertDocument()

    const documentRes1 = await chai.request(server)
      .get(`/documents/${documentRes.body.id}`)

    expect(documentRes.status).to.equal(200)
    checkDocumentResult(documentRes1, revisionRes, userRes, digitalAssetRes, categoryRes, documentPayload)

  })

  it('should update a single document', async function() {

    const {
      documentRes,
      appRes,
      documentPayload
    } = await insertDocument()

    const categoryPayload = getRandomCatPayload(appRes.body.id)
    const categoryRes = await chai.request(server)
      .post('/categories')
      .send(categoryPayload)

    documentPayload.categoryIds = [categoryRes.body.id]
    documentPayload.title = 'New title'

    const updatedRes = await chai.request(server)
      .patch(`/documents/${documentRes.body.id}`)
      .send(documentPayload)

    // checking CASCADE delete on document category join table after the update
    expect(updatedRes.body.title).to.equal(documentPayload.title)
    expect(updatedRes.body.categories).to.not.be.undefined
    expect(updatedRes.body.categories.length).to.equal(1)
    expect(updatedRes.body.categories[0]).to.be.an('object')
    expect(updatedRes.body.categories[0].id).to.equal(categoryRes.body.id)

  })

  it('should delete a document', async function() {

    const {documentRes} = await insertDocument()

    const res = await chai.request(server)
      .delete(`/documents/${documentRes.body.id}`)

    expect(res.status).to.equal(200)

  })

  describe('should get documents', function () {

    let documentReses,
      applicationId,
      organizationId,
      userId1,
      userId2,
      categoryId1,
      categoryId2

    beforeEach(async function () {
      await migrateUp()

      // inserting documents
      //   document0: user1, category1
      //   document1: user1, category1, published, title: 'Test title'
      //   document2: user2, category2

      documentReses = []

      const orgPayload = getRandomOrgPayload()
      const orgRes = await chai.request(server)
        .post('/organizations')
        .send(orgPayload)
      organizationId = orgRes.body.id

      const appPayload = getRandomAppPayload(organizationId)
      const appRes = await chai.request(server)
        .post('/applications')
        .send(appPayload)
      applicationId = appRes.body.id

      const userPayload1 = getRandomUserPayload(organizationId, applicationId)
      const userRes1 = await chai.request(server)
        .post('/users')
        .send(userPayload1)
      userId1 = userRes1.body.id

      const userPayload2 = getRandomUserPayload(organizationId, applicationId)
      const userRes2 = await chai.request(server)
        .post('/users')
        .send(userPayload2)
      userId2 = userRes2.body.id

      const categoryPayload1 = getRandomCatPayload(applicationId)
      const categoryRes1 = await chai.request(server)
        .post('/categories')
        .send(categoryPayload1)
      categoryId1 = categoryRes1.body.id

      const categoryPayload2 = getRandomCatPayload(applicationId)
      const categoryRes2 = await chai.request(server)
        .post('/categories')
        .send(categoryPayload2)
      categoryId2 = categoryRes2.body.id

      for (let i = 0; i < 3; i++) {
        let userId = userId1,
          categoryId = categoryId1,
          status,
          title

        if (i === 1) {
          status = 'published'
          title = 'Test title'
        }

        if (i === 2) {
          userId = userId2
          categoryId = categoryId2
        }
        documentReses.push(
          await insertDocument(organizationId, applicationId, userId, categoryId, status, title)
        )
      }

    })

    afterEach(async function() {
      await migrateDown()
    })

    it('all', async function() {

      const allDocumentRes = await chai.request(server)
        .get(`/documents`)
        .query({
          organizationId,
          applicationId,
        })

      expect(allDocumentRes.status).to.equal(200)
      expect(allDocumentRes.body.length).to.equal(3)

    })

    it('except ignored', async function() {

      const allDocumentRes = await chai.request(server)
        .get(`/documents`)
        .query({
          organizationId,
          applicationId,
          'ignoreDocumentIds[]': [documentReses[0].documentRes.body.id]
        })

      expect(allDocumentRes.status).to.equal(200)
      expect(allDocumentRes.body.length).to.equal(2)
      expect(allDocumentRes.body[0].id).to.equal(documentReses[1].documentRes.body.id)
      expect(allDocumentRes.body[1].id).to.equal(documentReses[2].documentRes.body.id)

    })

    it('by user1', async function() {

      const allDocumentRes = await chai.request(server)
        .get(`/documents`)
        .query({
          organizationId,
          applicationId,
          userId: userId1,
        })

      expect(allDocumentRes.status).to.equal(200)
      expect(allDocumentRes.body.length).to.equal(2)
      expect(allDocumentRes.body[0].id).to.equal(documentReses[0].documentRes.body.id)
      expect(allDocumentRes.body[1].id).to.equal(documentReses[1].documentRes.body.id)

    })

    it('published by user 1', async function() {

      const allDocumentRes = await chai.request(server)
        .get(`/documents`)
        .query({
          organizationId,
          applicationId,
          userId: userId1,
          status: 'published',
        })

      expect(allDocumentRes.status).to.equal(200)
      expect(allDocumentRes.body.length).to.equal(1)
      expect(allDocumentRes.body[0].id).to.equal(documentReses[1].documentRes.body.id)

    })

    it('title like "Test"', async function() {

      const allDocumentRes = await chai.request(server)
        .get(`/documents`)
        .query({
          organizationId,
          applicationId,
          title: 'Test'
        })

      expect(allDocumentRes.status).to.equal(200)
      expect(allDocumentRes.body.length).to.equal(1)
      expect(allDocumentRes.body[0].id).to.equal(documentReses[1].documentRes.body.id)

    })

    it('by category1', async function() {

      const allDocumentRes = await chai.request(server)
        .get(`/documents`)
        .query({
          organizationId,
          applicationId,
          'categoryIds[]': [categoryId1]
        })

      expect(allDocumentRes.status).to.equal(200)
      expect(allDocumentRes.body.length).to.equal(2)
      expect(allDocumentRes.body[0].id).to.equal(documentReses[0].documentRes.body.id)
      expect(allDocumentRes.body[1].id).to.equal(documentReses[1].documentRes.body.id)

    })

    it('by category1 and category2', async function() {

      const allDocumentRes = await chai.request(server)
        .get(`/documents`)
        .query({
          organizationId,
          applicationId,
          'categoryIds[]': [categoryId1, categoryId2]
        })

      expect(allDocumentRes.status).to.equal(200)
      expect(allDocumentRes.body.length).to.equal(3)
      expect(allDocumentRes.body[0].id).to.equal(documentReses[0].documentRes.body.id)
      expect(allDocumentRes.body[1].id).to.equal(documentReses[1].documentRes.body.id)
      expect(allDocumentRes.body[2].id).to.equal(documentReses[2].documentRes.body.id)

    })

  })

})
