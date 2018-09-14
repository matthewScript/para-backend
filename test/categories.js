import chai from 'chai'
import chaiHttp from 'chai-http'
import server from '../src/app'
import {
  getRandomAppPayload,
  getRandomOrgPayload,
  getRandomCatPayload,
  migrateUp,
  migrateDown,
} from './helpers'

const expect = chai.expect
chai.use(chaiHttp)

describe('categories', function() {
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

  it('should create a category', async function () {

    const catPayload = getRandomCatPayload(this.application.id)

    const category = await chai.request(server)
      .post('/categories')
      .send(catPayload)

    // root fields
    expect(category.status).to.equal(200)
    expect(category.body.id).to.be.a.string
    expect(category.body.applicationId).to.equal(this.application.id)
    expect(category.body.sid).to.be.a.string
    expect(category.body.slug).to.be.a.string
    expect(category.body.title).to.equal(catPayload.title)

    // meta fields
    expect(category.body.meta).to.deep.equal(catPayload.meta)
  })

  it('should fail creating a category with a bad application Id', async function () {
    const response = await chai.request(server)
      .post('/categories')
      .send(getRandomCatPayload("badId"))
    expect(response.status).to.equal(400)
  })

  it('should 404 when deleting non-existing category', async function() {
    const response = await chai.request(server)
      .delete(`/categories/badid`)
    expect(response.status).to.equal(404)
  })

  it('should delete a category', async function () {
    const category = await chai.request(server)
      .post('/categories')
      .send(getRandomCatPayload(this.application.id))

    const response = await chai.request(server)
      .delete(`/categories/${category.body.id}`)
    expect(response.status).to.equal(200)
  })
})
