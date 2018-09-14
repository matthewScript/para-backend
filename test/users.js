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

async function insertUser(withDocuments) {

  const orgPayload = getRandomOrgPayload()
  const orgRes = await chai.request(server)
    .post('/organizations')
    .send(orgPayload)

  const appPayload = getRandomAppPayload(orgRes.body.id)
  const appRes = await chai.request(server)
    .post('/applications')
    .send(appPayload)

  const userPayload = getRandomUserPayload(orgRes.body.id, appRes.body.id)
  const userRes = await chai.request(server)
    .post('/users')
    .send(userPayload)

  if (!withDocuments) {
    return {
      userRes,
      userPayload
    }
  } else {
    const dastPayload = getRandomDastPayload(appRes.body.id)
    const digitalAssetRes = await chai.request(server)
      .post('/digital-assets')
      .send(dastPayload)

    const documentPayloads = [],
      documentReses = [],
      categoryPayloads = [],
      categoryReses = [],
      revisionPayloads = [],
      revisionReses = []

    for (let i = 0; i < 2; i++) {

      categoryPayloads.push(
        getRandomCatPayload(appRes.body.id)
      )
      categoryReses.push(
        await chai.request(server)
          .post('/categories')
          .send(categoryPayloads[i])
      )

      documentPayloads.push(
        getRandomDocumentPayload(
          appRes.body.id,
          userRes.body.id,
          digitalAssetRes.body.id,
          [categoryReses[i].body.id],
          i === 1 ? 'published' : null
        )
      )

      documentReses.push(
        await chai.request(server)
          .post('/documents')
          .send(documentPayloads[i])
      )

      revisionPayloads.push(
        getRandomDocumentRevisionPayload(documentReses[i].body.id)
      )
      revisionReses.push(
        await chai.request(server)
          .post('/document-revisions')
          .send(revisionPayloads[i])
      )

      documentPayloads[i].activeRevisionId = revisionReses[i].body.id

      documentReses[i] = await chai.request(server)
        .patch(`/documents/${documentReses[i].body.id}`)
        .send(documentPayloads[i])
    }

    return {
      documentReses,
      revisionReses,
      categoryReses,
      userRes,
      appRes,
      digitalAssetRes,
      userPayload,
      documentPayloads
    }
  }

}

describe('users', function() {

  beforeEach(async function() {
    await migrateUp()
  })

  afterEach(async function() {
    await migrateDown()
  })

  it('should create a user', async function() {

    const {
      userPayload,
      userRes
    } = await insertUser()

    expect(userRes.status).to.be.equal(200)
    expect(userRes.body.id).to.be.a.string
    expect(userRes.body.sid).to.be.a.string
    expect(userRes.body.username).to.equal(userPayload.username)
    expect(userRes.body.email).to.equal(userPayload.email)
    expect(userRes.body.bio).to.equal(userPayload.bio)
    expect(userRes.body.hash).to.equal(userPayload.hash)
    expect(userRes.body.status).to.be.oneOf(['active', 'inactive', 'deleted'])
    expect(userRes.body.meta).to.be.deep.equal(userPayload.meta)
    expect(userRes.body.roles).to.be.deep.equal(userPayload.roles)

  })

  it('should fail creating an invalid user', async function() {

    const response = await chai.request(server)
      .post('/users')
      .send({})

    expect(response.status).to.be.equal(400)

  })

  it('should delete a user', async function() {

    const {userRes} = await insertUser()

    const response = await chai.request(server)
      .delete(`/users/${userRes.body.id}`)

    expect(response.status).to.be.equal(200)

  })

  it('Should fail deleting a non-existing user', async function() {

    const response = await chai.request(server)
      .delete(`/users/badId`)

    expect(response.status).to.be.equal(404)

  })

  // Skipped because documents table has no SID, yet it extends base model
  it('Should get a user\'s documents ', async function() {

    const {
      documentReses,
      userRes,
    } = await insertUser(true)

    const userDocumentRes = await chai.request(server)
      .get(`/users/${userRes.body.id}/documents`)

    expect(userDocumentRes.status).to.be.equal(200)
    expect(userDocumentRes.body.length).to.be.equal(2)

    for (let i = 0; i < 2; i++) {
      expect(userDocumentRes.body[i]).to.be.an('object')
      expect(userDocumentRes.body[i].title).to.be.equal(documentReses[i].body.title)
      expect(userDocumentRes.body[i].activeRevision).to.be.an('object')
      expect(userDocumentRes.body[i].activeRevision).to.be.deep.equal(documentReses[i].body.activeRevision)
      expect(userDocumentRes.body[i].featuredImage).to.be.an('object')
      expect(userDocumentRes.body[i].featuredImage).to.be.deep.equal(documentReses[i].body.featuredImage)
      expect(userDocumentRes.body[i].categories).to.be.an('array')
      expect(userDocumentRes.body[i].categories.length).to.be.equal(1)
      expect(userDocumentRes.body[i].categories).to.be.deep.equal(documentReses[i].body.categories)
    }

  })

  it('Should get user\'s published documents', async function () {

    const {
      documentReses,
      userRes
    } = await insertUser(true)

    const userDocumentRes = await chai.request(server)
      .get(`/users/${userRes.body.id}/documents`)
      .query({status: 'published'})

    expect(userDocumentRes.status).to.be.equal(200)
    expect(userDocumentRes.body.length).to.be.equal(1)

    expect(userDocumentRes.body[0]).to.be.an('object')
    expect(userDocumentRes.body[0].title).to.be.equal(documentReses[1].body.title)
    expect(userDocumentRes.body[0].activeRevision).to.be.an('object')
    expect(userDocumentRes.body[0].activeRevision).to.be.deep.equal(documentReses[1].body.activeRevision)
    expect(userDocumentRes.body[0].featuredImage).to.be.an('object')
    expect(userDocumentRes.body[0].featuredImage).to.be.deep.equal(documentReses[1].body.featuredImage)
    expect(userDocumentRes.body[0].categories).to.be.an('array')
    expect(userDocumentRes.body[0].categories.length).to.be.equal(1)
    expect(userDocumentRes.body[0].categories).to.be.deep.equal(documentReses[1].body.categories)

  })

  it('Should fail getting a non-existing user\'s documents', async function() {

    const userDocuments = await chai.request(server)
      .get(`/users/badId/documents`)

    expect(userDocuments.status).to.be.equal(404)

  })
})
