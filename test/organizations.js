import chai from 'chai'
import chaiHttp from 'chai-http'
import server from '../src/app'
import {migrateUp, migrateDown, getRandomOrgPayload} from './helpers'


const expect = chai.expect
chai.use(chaiHttp)


describe('organizations', function() {

  beforeEach(async function () {
    await migrateUp()
  })

  afterEach(async function() {
    await migrateDown()
  })

  it('should create an organization', async function() {

    const orgPayload = getRandomOrgPayload()

    const res = await chai.request(server)
      .post('/organizations')
      .send(orgPayload)

    expect(res.status).to.equal(200)
    expect(res.body.id).to.be.a.string
    expect(res.body.sid).to.be.a.string
    expect(res.body.title).to.equal(orgPayload.title)
    expect(res.body.desc).to.equal(orgPayload.desc)
    expect(res.body.status).to.equal(orgPayload.status)
    expect(res.body.meta).to.deep.equal(orgPayload.meta)

  })

  it('should 404 when deleting non-existing organization', async function() {

    const res = await chai.request(server)
      .delete(`/organizations/badid`)

    expect(res.status).to.equal(404)

  })

  it('should delete an organization', async function() {

    const orgPayload = getRandomOrgPayload()

    const res = await chai.request(server)
      .post('/organizations')
      .send(orgPayload)

    const res2 = await chai.request(server)
      .delete(`/organizations/${res.body.id}`)

    expect(res2.status).to.equal(200)

  })

})
