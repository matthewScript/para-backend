import chai from 'chai'
import chaiHttp from 'chai-http'
import server from '../src/app'
import {migrateUp, migrateDown,
  getRandomAppPayload, getRandomOrgPayload, getRandomDastPayload} from './helpers'


const expect = chai.expect
chai.use(chaiHttp)


describe('digital assets', function() {

  beforeEach(async function () {
    await migrateUp()

    const organization = await chai.request(server)
      .post('/organizations')
      .send(getRandomOrgPayload())

    const application = await chai.request(server)
      .post('/applications')
      .send(getRandomAppPayload(organization.body.id))

    this.application = application.body
  })

  afterEach(async function() {
    await migrateDown()
  })

  it('should create a digital asset', async function() {

    const digitalAssetPayload = getRandomDastPayload(this.application.id)
    const digitalAsset = await chai.request(server)
      .post('/digital-assets')
      .send(digitalAssetPayload)

    expect(digitalAsset.status).to.equal(200)
    expect(digitalAsset.body.id).to.be.a.string
    expect(digitalAsset.body.sid).to.be.a.string
    expect(digitalAsset.body.applicationId).to.equal(digitalAssetPayload.applicationId)
    expect(digitalAsset.body.title).to.equal(digitalAssetPayload.title)
    expect(digitalAsset.body.desc).to.equal(digitalAssetPayload.desc)
    expect(digitalAsset.body.status).to.equal(digitalAssetPayload.status)
    expect(digitalAsset.body.mimetype).to.equal(digitalAssetPayload.mimetype)
    expect(digitalAsset.body.attribution).to.equal(digitalAssetPayload.attribution)
    expect(digitalAsset.body.html).to.equal(digitalAssetPayload.html)
    expect(digitalAsset.body.filename).to.equal(digitalAssetPayload.filename)
    expect(digitalAsset.body.url).to.equal(digitalAssetPayload.url)
    expect(digitalAsset.body.tags).to.deep.equal(digitalAssetPayload.tags)
    expect(digitalAsset.body.meta).to.deep.equal(digitalAssetPayload.meta)

  })

  it('should fail creating a digital asset with a bad application ID', async function() {
    const response = await chai.request(server)
      .post('/digital-assets')
      .send(getRandomDastPayload("badId"))

    expect(response.status).to.equal(400)
  })


  it('should 404 when deleting non-existing digital asset', async function() {
    const response = await chai.request(server)
      .delete(`/digital-assets/badid`)

    expect(response.status).to.equal(404)
  })

  it('should delete a digital asset', async function () {
    const digitalAsset = await chai.request(server)
      .post('/digital-assets')
      .send(getRandomDastPayload(this.application.id))

    const response = await chai.request(server)
      .delete(`/digital-assets/${digitalAsset.body.id}`)

    expect(response.status).to.equal(200)

  })

})
