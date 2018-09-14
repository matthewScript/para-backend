import chai from 'chai'
import chaiHttp from 'chai-http'
import server from '../src/app'
import {migrateUp, migrateDown,
  getRandomAppPayload, getRandomOrgPayload} from './helpers'

const expect = chai.expect
chai.use(chaiHttp)


describe('applications', function() {

  beforeEach(async function () {
    await migrateUp()

    const organization = await chai.request(server)
      .post('/organizations')
      .send(getRandomOrgPayload())

    this.organization = organization.body
  })

  afterEach(async function() {
    await migrateDown()
  })

  it('should fail to create an application with bad org', async function() {

    const response = await chai.request(server)
      .post('/applications')
      .send(getRandomAppPayload('fakeorgid'))

    expect(response.status).to.equal(400)

  })

  it('should create an application', async function() {

    const appPayload = getRandomAppPayload(this.organization.id)
    const application = await chai.request(server)
      .post('/applications')
      .send(appPayload)

    expect(application.status).to.equal(200)
    expect(application.body.id).to.be.a.string
    expect(application.body.title).to.equal(appPayload.title)
    expect(application.body.organizationId).to.equal(appPayload.organizationId)
    expect(application.body.status).to.equal(appPayload.status)
    expect(application.body.meta).to.deep.equal(appPayload.meta)
  })

  it('should 404 when deleting non-existing application', async function() {

    const res = await chai.request(server)
      .delete(`/applications/badid`)

    expect(res.status).to.equal(404)

  })

  it('should delete an application', async function() {

    const application = await chai.request(server)
      .post('/applications')
      .send(getRandomAppPayload(this.organization.id))

    const response = await chai.request(server)
      .delete(`/applications/${application.body.id}`)

    expect(response.status).to.equal(200)

  })

})
