import chai from "chai"
import chaiHttp from "chai-http"
import server from "../src/app"
import {
  getRandomOrgPayload,
  getRandomChannelPayload,
  migrateUp,
  migrateDown,
  getRandomAppPayload
} from "./helpers"

const expect = chai.expect
chai.use(chaiHttp)

describe("channels", function() {
  beforeEach(async function() {
    await migrateUp()

    const organization = await chai
      .request(server)
      .post("/organizations")
      .send(getRandomOrgPayload())

    const application = await chai
      .request(server)
      .post("/applications")
      .send(getRandomAppPayload(organization.body.id))

    this.organization = organization.body
    this.application = application.body
  })

  afterEach(async function() {
    await migrateDown()
  })

  it("should create a channel", async function() {
    const channelPayload = getRandomChannelPayload(this.application.id)

    const channel = await chai
      .request(server)
      .post("/channels")
      .send(channelPayload)

    // Status of request
    expect(channel.status).to.be.equal(200)

    // root fields
    expect(channel.body.id).to.be.string
    expect(channel.body.createdAt).to.be.string
    expect(channel.body.title).to.equal(channelPayload.title)
    expect(channel.body.applicationId).to.equal(this.application.id)
    expect(channel.body.slug).to.equal(channelPayload.slug)
    expect(channel.body.desc).to.equal(channelPayload.desc)
    expect(channel.body.status).to.equal(channelPayload.status)

    // resources field
    expect(channel.body.resources).to.have.lengthOf(2)
    expect(channel.body.resources[0]).to.be.deep.equal(channelPayload.resources[0])
    expect(channel.body.resources[1]).to.be.deep.equal(channelPayload.resources[1])
  })

  it('should fail creating a channel with invalid data', async function() {
    const response = await chai
      .request(server)
      .post("/channels")
      .send({})

    expect(response.status).to.equal(400)
  })

  it('should fail creating a channel with an invalid application id', async function() {
    const response = await chai
      .request(server)
      .post("/channels")
      .send(getRandomChannelPayload("badId"))

    expect(response.status).to.equal(400)
  })

  it('should fail deleting a channel with an invalid ID', async function() {
    const response = await chai
      .request(server)
      .delete(`/channels/someId`)

    expect(response.status).to.equal(404)
  })

  it("should delete a channel", async function() {
    const channel = await chai
      .request(server)
      .post("/channels")
      .send(getRandomChannelPayload(this.application.id))

    const response = await chai
      .request(server)
      .delete(`/channels/${channel.body.id}`)

    expect(response.status).to.equal(200)
  })

})
