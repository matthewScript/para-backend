import chai from 'chai'
import chaiHttp from 'chai-http'
import server from '../src/app'
import {migrateUp, migrateDown, getRandomOrgPayload, getRandomAppPayload, getRandomAdCampaignPayload, getRandomAdAccountPayload} from './helpers'


const expect = chai.expect
chai.use(chaiHttp)

describe('ad-campaigns', function() {

  beforeEach(async function () {
    await migrateUp()
  })

  afterEach(async function() {
    await migrateDown()
  })

  it('should create an ad-campaign', async function() {

    const org = await chai.request(server)
      .post('/organizations')
      .send(getRandomOrgPayload())

    const app = await chai.request(server)
      .post('/applications')
      .send(getRandomAppPayload(org.body.id))

    const adAccount = await chai.request(server)
      .post('/ad-accounts')
      .send(getRandomAdAccountPayload(app.body.id))

    const adCampaignPayload = getRandomAdCampaignPayload(app.body.id, adAccount.body.id)

    const adCampaign = await chai.request(server)
      .post('/ad-campaigns')
      .send(adCampaignPayload)

    expect(adCampaign.status).to.equal(200)
    expect(adCampaign.body.id).to.be.a.string
    expect(adCampaign.body.activation).to.equal(adCampaignPayload.activation)
    expect(adCampaign.body.adAccountId).to.be.a.string
    expect(adCampaign.body.applicationId).to.equal(adCampaignPayload.applicationId)
    expect(adCampaign.body.clone).to.equal(adCampaignPayload.clone)
    expect(adCampaign.body.digitalAssetIds).to.eql(adCampaignPayload.digitalAssetIds)
    expect(adCampaign.body.fbAdCampaignConfigs).to.eql(adCampaignPayload.fbAdCampaignConfigs)
    expect(adCampaign.body.inProgressDate).to.equal(adCampaignPayload.inProgressDate)
    expect(adCampaign.body.headlines).to.eql(adCampaignPayload.headlines)
    expect(adCampaign.body.platforms).to.eql(adCampaignPayload.platforms)
    expect(adCampaign.body.link).to.be.a.string
    expect(adCampaign.body.sid).to.be.a.string
    expect(adCampaign.body.title).to.equal(adCampaignPayload.title)
    expect(adCampaign.body.status).to.equal(adCampaignPayload.status)
    expect(adCampaign.body.texts).to.eql(adCampaignPayload.texts)

  })

  it('should fail creating an ad campaign with a bad account ID', async function() {

    const org = await chai.request(server)
      .post('/organizations')
      .send(getRandomOrgPayload())

    const app = await chai.request(server)
      .post('/applications')
      .send(getRandomAppPayload(org.body.id))

    const response = await chai.request(server)
      .post('/ad-campaigns')
      .send(getRandomAdAccountPayload(app.body.id, "badId"))

    expect(response.status).to.equal(400)

  })

  it('should 404 when deleting non-existing ad campaign', async function() {

    const response = await chai.request(server)
      .delete(`/ad-campaigns/badid`)

    expect(response.status).to.equal(404)

  })

  it('should delete an ad-campaign', async function() {

    const org = await chai.request(server)
      .post('/organizations')
      .send(getRandomOrgPayload())

    const app = await chai.request(server)
      .post('/applications')
      .send(getRandomAppPayload(org.body.id))

    const adAccount = await chai.request(server)
      .post('/ad-accounts')
      .send(getRandomAdAccountPayload(app.body.id))

    const adCampaignPayload = getRandomAdCampaignPayload(app.body.id, adAccount.body.id)
    const adCampaign = await chai.request(server)
      .post('/ad-campaigns')
      .send(adCampaignPayload)

    const res = await chai.request(server)
      .delete(`/ad-campaigns/${adCampaign.body.id}`)
    expect(res.status).to.equal(200)

  })

})
