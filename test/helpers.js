import db from '../src/db'
import Chance from 'chance'

const random = new Chance()

function generateRandomStringArray(length) {
  return Array(length)
    .fill()
    .map(el => random.word())
}

function generateRandomObject(size) {
  return Array(size)
    .fill()
    .reduce((prev) => {
      const prop = random.word()
      const value = random.sentence({words: 3})
      return {
        ...prev,
        [prop]: value
      }
    }, {})
}


/*
 * Rollback all applied migrations. This will effectively clear the DB.
 */
async function migrateDown() {
  while (await db.migrate.currentVersion() !== 'none') {
    await db.migrate.rollback()
  }
}

/*
 * Apply all migrations
 */
async function migrateUp() {
  await migrateDown()
  await db.migrate.latest()
}

const getRandomAppPayload = function (orgId) {
  return {
    title: 'App ' + random.word(),
    organizationId: orgId,
    status: random.pickone(['active', 'inactive', 'deleted']),
    meta: {
      attributionRequired: random.bool(),
      primaryColor: random.color(),
      social: {
        appleNews: {
          apiId: random.guid(),
          apiSecret: random.hash(),
          channelId: random.hash()
        },
        facebook: {
          accessToken: random.hash(),
          appId: random.guid(),
          appSecret: random.string({length: 20}),
          fbiaPath: '/fbia',
          pageAccessToken: random.string({length: 5}),
          pageId: random.guid(),
          pixelId: random.guid()
        }
      },
      cdn: {
        cacheKeys: {
          channelAPI: random.name()
        },
        services: {
          media: {
            hostname: random.url()
          },
          site: {
            hostname: random.url()
          }
        }
      },
      env: {
        production: {
          host: random.url(),
          hostPreview: random.url(),
          protocol: 'https'
        },
        staging: {
          host: random.url(),
          hostPreview: random.url(),
          protocol: 'https'
        }
      }
    }
  }
}

const getRandomOrgPayload = function () {
  return {
    title: 'Organization ' + random.word(),
    desc: random.sentence({words: 10}),
    sid: random.string({length: 5}),
    status: random.pickone(['active', 'inactive', 'deleted']),
    meta: {
      imageId: random.hash(),
      timezone: random.timezone().name
    }
  }
}

const getRandomCatPayload = function (appId) {
  return {
    id: random.guid(),
    applicationId: appId,
    title: 'Category ' + random.word(),
    meta: {
      customHeading: '',
      customHtml: '',
      isCustom: random.bool()
    },
    status: random.pickone(['active', 'inactive', 'deleted']),
    slug: 'test' + random.word(),
  }
}


const getRandomUserPayload = function (orgId, appId) {
  const result = {
    organizationId: orgId,
    username: random.name(),
    email: random.email(),
    firstName: random.first(),
    lastName: random.last(),
    slug: random.string({length: 5}),
    timezone: random.timezone().name,
    imageId: random.hash(),
    bio: random.sentence({words: 10}),
    hash: random.hash(),
    status: random.pickone(['active', 'inactive', 'deleted']),
    meta: {
      facebook: random.url(),
      twitter: random.url()
    },
    roles: {
      applications: {
        [appId]: ['writer'],
        [orgId]: ['writer']
      },
      organizations: {}
    }
  }
  return result
}

const getRandomDastPayload = function (appId) {
  return {
    applicationId: appId,
    title: 'Digital Asset ' + random.word(),
    desc: random.sentence({words: 10}),
    status: random.pickone(['active', 'inactive', 'deleted']),
    mimetype: 'image/png',
    attribution: random.bool(),
    html: '<html></html>',
    filename: random.word(),
    url: random.url(),
    tags: ['default_tag'],
    meta: {
      author_name: random.name(),
      author_url: random.url(),
      caption: random.word(),
      bucket: random.word(),
      encoding: '7bit',
      extension: '.jpg',
      cache_age: random.integer(),
      width: random.integer(),
      height: random.integer(),
      originalEmbedUrl: random.url(),
      originalFileUrl: random.url(),
      provider_name: random.word(),
      size: random.integer(),
      crop: {
        aspect: random.integer(),
        width: random.integer(),
        x: random.integer(),
        y: random.integer(),
      },
      customWidth: random.integer(),
      customHeight: random.integer(),
      provider_url: random.url(),
      state: random.pickone(['processing', 'ready']),
      type: random.word()
    }
  }
}

const getRandomChannelPayload = function(appId) {
  return {
    applicationId: appId,
    title: 'Channel ' + random.word(),
    slug: random.word(),
    desc: random.word(),
    status: random.pickone(['active', 'inactive', 'deleted']),
    resources: [
      {
        categorySlugs: generateRandomStringArray(3),
        limit: random.integer(),
        name: random.name()
      },
      {
        categorySlugs: generateRandomStringArray(3),
        limit: random.integer(),
        name: random.name()
      }
    ]
  }
}

const getRandomFacebookIAPayload = function () {
  return {
    articleId: random.fbid(),
    articleImportId: random.fbid(),
    canonicalUrl: random.url(),
    id: random.hash(),
    importStatus: random.pickone(['success', 'importing', 'failed']),
    markup: '<html></html>',
    sid: random.string({length: 7}),
    status: random.pickone(['active', 'inactive', 'deleted']),
  }
}


const getRandomDocumentPayload = function (appId, userId, digitalAssetId, categoryIds, status, title) {
  return {
    applicationId: appId,
    userId: userId,
    featuredImageId: digitalAssetId,
    categoryIds: categoryIds,
    title: title || random.sentence({words: 10}),
    slug: random.string({length: 10}),
    mode: random.pickone(['article', 'listacle', 'slideshow']),
    permalink: random.url(),
    status: status || random.pickone(['draft', 'scheduled', 'deleted']),
    tags: ['viral videos'],
    timezone: random.timezone().name,
    excerpt: random.sentence({words: 10}),
    lastPurgedAt: random.date().toISOString(),
    publishedAt: random.date().toISOString(),
    meta: {
      desc: random.sentence({words: 10}),
      facebookDesc: random.sentence({words: 10}),
      facebookImageId: random.hash(),
      facebookTitle: random.sentence({words: 5}),
      instant: random.bool(),
      intro: random.word(),
      listType: random.word(),
      title: random.sentence({words: 5}),
      twitterDesc: random.sentence({words: 5}),
      twitterImageId: random.hash(),
      twitterTitle: random.sentence({words: 5}),
    }
  }
}


const getRandomDocumentRevisionPayload = function (docId) {
  return {
    documentId: docId,
    cards: [
      {
        digitalAssetId: random.hash(),
        type: random.word()
      },
      {
        value: random.sentence({words: 10}),
        type: random.word()
      }
    ],
    status: random.pickone(['active', 'inactive', 'deleted'])
  }
}

const getRandomAppleNewsPayload = function(documentId) {
  return {
    documentId,
    articleId: random.string({length: 15}),
    articleJson: generateRandomObject(3),
    articleRevision: random.string({length: 15}),
    status: random.pickone(['active', 'inactive', 'deleted']),
  }
}

const getRandomAdAccountPayload = function (appId) {

  return {
    title: 'AdAccount ' + random.word(),
    applicationId: appId,
    status: random.pickone(['active', 'inactive', 'deleted']),
    facebookAdAccountId: random.guid(),
    facebookCustomConversionId: random.guid(),
  }

}

const getRandomAdCampaignPayload = function (appId, adAccountId) {

  return {
    title: 'AdCampaign ' + random.word(),
    activation: random.pickone(['finished', 'progress', 'error']),
    applicationId: appId,
    clone: random.bool(),
    adAccountId: adAccountId,
    digitalAssetIds: ['digital-asset'],
    fbAdCampaignConfigs: ['ad-campaign-config'],
    platforms: random.pickone(['twitter', 'facebook']),
    headlines: ['headline'],
    link: random.url(),
    texts: ['text'],
    status: random.pickone(['active', 'inactive', 'deleted']),
  }

}

export {
  migrateUp,
  migrateDown,
  getRandomAppPayload,
  getRandomOrgPayload,
  getRandomUserPayload,
  getRandomDastPayload,
  getRandomChannelPayload,
  getRandomCatPayload,
  getRandomFacebookIAPayload,
  getRandomDocumentPayload,
  getRandomAppleNewsPayload,
  getRandomDocumentRevisionPayload,
  getRandomAdAccountPayload,
  getRandomAdCampaignPayload,
}
