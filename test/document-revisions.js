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

async function insertDocumentRevision(isUpdate, docId) {

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

  const categoryPayload = getRandomCatPayload(appRes.body.id)
  const categoryRes = await chai.request(server)
    .post('/categories')
    .send(categoryPayload)

  const dastPayload = getRandomDastPayload(appRes.body.id)
  const digitalAssetRes = await chai.request(server)
    .post('/digital-assets')
    .send(dastPayload)

  const documentPayload = getRandomDocumentPayload(
    appRes.body.id,
    userRes.body.id,
    digitalAssetRes.body.id,
    [categoryRes.body.id]
  )
  const documentRes = await chai.request(server)
    .post('/documents')
    .send(documentPayload)

  const revisionPayload = getRandomDocumentRevisionPayload(documentRes.body.id)
  const revisionRes = await chai.request(server)
    .post('/document-revisions')
    .send(revisionPayload)

  return {
    revisionRes,
    revisionPayload
  }

}

describe('document revisions', function() {

  beforeEach(async function () {
    await migrateUp()
  })

  afterEach(async function() {
    await migrateDown()
  })

  it('should create a document revision', async function() {

    const {
      revisionRes,
      revisionPayload
    } = await insertDocumentRevision()

    expect(revisionRes.status).to.equal(200)
    expect(revisionRes.body.id).to.be.a.string
    expect(revisionRes.body.sid).to.be.a.string
    expect(revisionRes.body.status).to.equal(revisionPayload.status)
    expect(revisionRes.body.cards).to.deep.equal(revisionPayload.cards)

  })

  it('should 404 when deleting non-existing document revision', async function() {

    const res = await chai.request(server)
      .delete(`/document-revisions/badid`)

    expect(res.status).to.equal(404)

  })

  it('should delete a document revision', async function() {

    const {revisionRes} = await insertDocumentRevision()

    const res2 = await chai.request(server)
      .delete(`/document-revisions/${revisionRes.body.id}`)

    expect(res2.status).to.equal(200)

  })

})
