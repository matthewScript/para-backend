import chai from 'chai'
import chaiHttp from 'chai-http'
import server from '../src/app'
import {migrateUp, migrateDown, getRandomFacebookIAPayload} from './helpers'


const expect = chai.expect
chai.use(chaiHttp)


describe('facebook instance articles', function() {

  beforeEach(async function () {
    await migrateUp()
  })

  afterEach(async function() {
    await migrateDown()
  })

  it('should create an facebook instance article', async function() {

    const facebookIAPayload = getRandomFacebookIAPayload()

    const res = await chai.request(server)
      .post('/facebook-ias')
      .send(facebookIAPayload)

    expect(res.status).to.equal(200)
    expect(res.body.id).to.be.a.string
    expect(res.body.sid).to.be.a.string
    expect(res.body.articleId).to.equal(facebookIAPayload.articleId)
    expect(res.body.articleImportId).to.equal(facebookIAPayload.articleImportId)
    expect(res.body.canonicalUrl).to.equal(facebookIAPayload.canonicalUrl)
    expect(res.body.importStatus).to.equal(facebookIAPayload.importStatus)
    expect(res.body.markup).to.equal(facebookIAPayload.markup)

  })

  it('should 404 when deleting non-existing facebook instance article', async function() {

    const res = await chai.request(server)
      .delete(`/facebook-ias/badid`)

    expect(res.status).to.equal(404)

  })

  it('should delete a facebook instance article', async function() {

    const facebookIAPayload = getRandomFacebookIAPayload()

    const res = await chai.request(server)
      .post('/facebook-ias')
      .send(facebookIAPayload)

    const res1 = await chai.request(server)
      .delete(`/facebook-ias/${res.body.id}`)

    expect(res1.status).to.equal(200)

  })

})
