import chai from 'chai'
import chaiHttp from 'chai-http'
import server from '../src/app'
import {migrateUp, migrateDown, getRandomOrgPayload, getRandomAppPayload, getRandomAdAccountPayload} from './helpers'


const expect = chai.expect
chai.use(chaiHttp)


describe('ad-accounts', function() {

  beforeEach(async function () {
    await migrateUp()
  })

  afterEach(async function() {
    await migrateDown()
  })

  it('should create an ad-account', async function() {

    const res = await chai.request(server)
      .post('/organizations')
      .send(getRandomOrgPayload())

    const res1 = await chai.request(server)
      .post('/applications')
      .send(getRandomAppPayload(res.body.id))

    const pagePayload = getRandomAdAccountPayload(res1.body.id)

    const res2 = await chai.request(server)
      .post('/ad-accounts')
      .send(pagePayload)

    expect(res2.status).to.equal(200)
    expect(res2.body.id).to.be.a.string
    expect(res2.body.facebookAdAccountId).to.be.a.string
    expect(res2.body.facebookCustomConversionId).to.be.a.string
    expect(res2.body.sid).to.be.a.string
    expect(res2.body.title).to.equal(pagePayload.title)
    expect(res2.body.desc).to.equal(pagePayload.desc)
    expect(res2.body.status).to.equal(pagePayload.status)

  })

  it('should fail creating an ad account with a bad application ID', async function() {

    const response = await chai.request(server)
      .post('/ad-accounts')
      .send(getRandomAdAccountPayload("badId"))

    expect(response.status).to.equal(400)

  })

  it('should 404 when deleting non-existing ad account', async function() {

    const response = await chai.request(server)
      .delete(`/ad-accounts/badid`)

    expect(response.status).to.equal(404)

  })

  it('should delete an ad-account', async function() {

    const res = await chai.request(server)
      .post('/organizations')
      .send(getRandomOrgPayload())

    const res1 = await chai.request(server)
      .post('/applications')
      .send(getRandomAppPayload(res.body.id))

    const pagePayload = getRandomAdAccountPayload(res1.body.id)

    const res2 = await chai.request(server)
      .post('/ad-accounts')
      .send(pagePayload)

    const res3 = await chai.request(server)
      .delete(`/ad-accounts/${res2.body.id}`)
    expect(res3.status).to.equal(200)

  })

})
