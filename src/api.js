import Organization from './structure/models/organization'
import Application from './structure/models/application'
import User from './structure/models/user'
import DigitalAsset from './structure/models/digital-asset'
import Category from './paradigm/models/category'
import Document from './paradigm/models/document'
import DocumentRevision from './paradigm/models/document-revision'
import Channel from './paradigm/models/channel'
import AppleNews from './paradigm/models/apple-news'
import FacebookInstanceArticle from './paradigm/models/facebook-ia'
import AdAccount from './paradigm/models/ad-account'
import AdCampaign from './paradigm/models/ad-campaign'

export default function(router) {

  router.get('/organizations', async (req, res) => {
    const orgs = await Organization
      .query()

    res.send(orgs)
  })

  router.post('/organizations', async (req, res) => {
    const pkg = req.body

    try {
      const org = await Organization
        .query()
        .insert(pkg)
      res.send(org)
    } catch (err) {
      res.status(400).send(err)
    }

  })

  router.delete('/organizations/:id', async (req, res) => {
    const id = req.params.id

    const deleted = await Organization
      .query()
      .where({id})
      .delete()

    if (!deleted) {
      return res.status(404).send()
    }

    res.send()
  })

  router.get('/applications', async (req, res) => {
    const apps = await Application
      .query()

    res.send(apps)
  })

  router.post('/applications', async (req, res) => {
    const pkg = req.body

    try {
      const app = await Application
        .query()
        .insert(pkg)
      res.send(app)
    } catch (err) {
      res.status(400).send(err)
    }
  })

  router.delete('/applications/:id', async (req, res) => {
    const id = req.params.id

    const deleted = await Application
      .query()
      .where({id})
      .delete()

    if (!deleted) {
      return res.status(404).send()
    }

    res.send()
  })

  router.post('/users', async (req, res) => {
    const pkg = req.body

    try {
      const user = await User
        .query()
        .insert(pkg)
      res.send(user)
    } catch (err) {
      res.status(400).send(err)
    }
  })

  router.delete('/users/:id', async (req, res) => {
    const id = req.params.id

    const deleted = await User
      .query()
      .where({id})
      .delete()

    if (!deleted) {
      res.status(404).send()
    } else {
      res.send()
    }
  })

  router.post('/digital-assets', async (req, res) => {
    const pkg = req.body

    try {
      const da = await DigitalAsset
        .query()
        .insert(pkg)
      res.send(da)
    } catch (err) {
      res.status(400).send(err)
    }
  })

  router.delete('/digital-assets/:id', async (req, res) => {
    const id = req.params.id

    const deleted = await DigitalAsset
      .query()
      .where({id})
      .delete()

    if (!deleted) {
      return res.status(404).send()
    }

    res.send()
  })

  router.get('/categories', async (req, res) => {
    const categories = await Category
      .query()

    res.send(categories)
  })

  router.post('/categories', async (req, res) => {
    const pkg = req.body

    try {
      const category = await Category
        .query()
        .insert(pkg)
      res.send(category)
    } catch (err) {
      res.status(400).send(err)
    }
  })

  router.delete('/categories/:id', async (req, res) => {
    const id = req.params.id
    const result = await Category
      .query()
      .where({id})
      .delete()
    if (!result) {
      return res.status(404).send()
    }
    res.send()
  })

  router.post('/documents', async (req, res) => {
    try {
      const pkg = req.body
      const categoryIds = pkg.categoryIds

      delete pkg.categoryIds

      const doc = await Document
        .query()
        .insert(pkg)

      if (categoryIds) {
        for (const categoryId of categoryIds) {
          await doc.$relatedQuery('categories').relate(categoryId)
        }
      }

      res.send(
        await Document
          .query()
          .findById(doc.id)
          .eager('[user, activeRevision, featuredImage, categories(orderByTitle)]', {
            orderByTitle: (builder) => {
              builder.orderBy('title')
            }
          })
      )
    } catch (err) {
      res.status(400).send(err)
    }
  })

  router.get('/documents/:id', async (req, res) => {
    const id = req.params.id

    try {
      const doc = await Document
        .query()
        .findById(id)
        .eager('[user, activeRevision, featuredImage, categories(orderByTitle)]', {
          orderByTitle: (builder) => {
            builder.orderBy('title')
          }
        })

      res.send(doc)
    } catch (err) {
      res.status(400).send(err)
    }
  })

  router.patch('/documents/:id', async (req, res) => {
    const id = req.params.id

    try {
      const pkg = req.body
      const categoryIds = pkg.categoryIds

      delete pkg.categoryIds

      const doc = await Document
        .query()
        .patchAndFetchById(id, pkg)

      if (categoryIds) {
        await doc.$relatedQuery('categories').unrelate()
        for (const categoryId of categoryIds) {
          await doc.$relatedQuery('categories').relate(categoryId)
        }
      }

      res.send(
        await Document
          .query()
          .findById(doc.id)
          .eager('[user, activeRevision, featuredImage, categories(orderByTitle)]', {
            orderByTitle: (builder) => {
              builder.orderBy('title')
            }
          })
      )
    } catch (err) {
      res.status(400).send(err)
    }
  })

  router.delete('/documents/:id', async (req, res) => {
    const id = req.params.id

    const deleted = await Document
      .query()
      .where({id})
      .delete()

    if (!deleted) {
      return res.status(404).send()
    }

    res.send()
  })

  router.get('/users/:id/documents', async (req, res) => {
    const {id} = req.params
    const user = await User.query().findById(id)
    if (!user) {
      return res.status(404).send()
    }

    const docs = await user
      .$relatedQuery('documents')
      .skipUndefined()
      .where('status', req.query.status)
      .eager('[activeRevision, featuredImage, categories(orderByTitle)]', {
        orderByTitle: (builder) => {
          builder.orderBy('title')
        }
      })

    if (!docs) {
      res.status(404).send()
    } else {
      res.send(docs)
    }
  })

  router.get('/documents', async (req, res) => {

    try {
      let query = Document
        .query()
        .where('applicationId', req.query.applicationId)
        .skipUndefined()
        .whereNotIn('id', req.query.ignoreDocumentIds)


      // Sqlite doesn't support this method. We would have to weigh up whether
      // supporting switchable backends is more important than being able to use
      // certain platform-specific features. Being able to use sqlite for tests
      // is a big plus, too.
      // .whereJsonSupersetOf('tags', req.query.tags)

      if (req.query.userId) {
        query = query
          .where('userId', req.query.userId)
      }

      if (req.query.status) {
        query = query
          .where('status', req.query.status)
      }

      if (req.query.title) {
        query = query
          .andWhere('title', 'like', `%${req.query.title}%`)
      }

      if (req.query.categoryIds) {
        query = query
          .whereExists(function() {
            this
              .select('*')
              .from('documents_categories')
              .whereRaw('documents.id = documents_categories.documentId')
              .whereRaw(`documents_categories.categoryId IN ("${req.query.categoryIds.join('", "')}")`)
          })
      }

      const docs = await query

      res.send(docs)
    } catch (err) {
      res.status(400).send()
    }

  })

  router.post('/document-revisions', async (req, res) => {
    const pkg = req.body

    const user = await DocumentRevision
      .query()
      .insert(pkg)

    res.send(user)
  })

  router.delete('/document-revisions/:id', async (req, res) => {
    const id = req.params.id

    const deleted = await DocumentRevision
      .query()
      .where({id})
      .delete()

    if (!deleted) {
      return res.status(404).send()
    }

    res.send()
  })

  // Channel Related Endpoints

  router.post('/channels', async (req, res) => {
    const pkg = req.body

    try {
      const channel = await Channel
        .query()
        .insert(pkg)
      res.json(channel)
    } catch (err) {
      res.status(400).send(err)
    }
  })

  router.delete('/channels/:id', async (req, res) => {
    const id = req.params.id

    const deleted = await Channel
      .query()
      .where({id})
      .delete()

    if (!deleted) {
      return res.status(404).send()
    }

    res.send()
  })

  router.post('/facebook-ias', async (req, res) => {
    try {
      const pkg = req.body

      const org = await FacebookInstanceArticle
        .query()
        .insert(pkg)

      res.send(org)
    } catch (err) {
      res.status(400).send(err)
    }
  })

  router.delete('/facebook-ias/:id', async (req, res) => {
    const id = req.params.id

    const deleted = await FacebookInstanceArticle
      .query()
      .where({id})
      .delete()

    if (!deleted) {
      return res.status(404).send()
    }

    res.send()
  })

  // Apple news Related Endpoints

  router.get('/apple-news', async (req, res) => {
    const news = await AppleNews
      .query()
      .orderBy('createdAt')
    if (news) {
      res.json(news)
    } else {
      res.status(404).send()
    }
  })

  router.get('/apple-news/:id', async (req, res) => {
    const {id} = req.params
    const news = await AppleNews
      .query()
      .where({id})
    if (news) {
      res.json(news)
    } else {
      res.status(404).send()
    }
  })

  router.get('/documents/:id/apple-news', async (req, res) => {
    const {id} = req.params
    const document = await Document.query().where({id})

    if (!document || document.length === 0) {
      res.status(404).send()
    }

    const news = await document[0]
      .$relatedQuery('appleNews')
      .skipUndefined()
      .eager('[document]')

    if (news) {
      res.json(news)
    } else {
      res.status(404).send()
    }
  })

  router.post('/apple-news', async (req, res) => {
    const pkg = req.body

    try {
      const news = await AppleNews
        .query()
        .insert(pkg)
      res.json(news)
    } catch (err) {
      res.status(400).send(err)
    }
  })

  router.delete('/apple-news/:id', async (req, res) => {
    const id = req.params.id

    const deleted = await AppleNews
      .query()
      .where({id})
      .delete()

    if (!deleted) {
      res.status(404).send()
    } else {
      res.send()
    }
  })

  // End Apple news Related Endpoints
  router.get('/ad-accounts', async (req, res) => {

    const orgs = await AdAccount
      .query()

    res.send(orgs)

  })

  router.post('/ad-accounts', async (req, res) => {

    const pkg = req.body
    try {
      const org = await AdAccount
        .query()
        .insert(pkg)

      res.send(org)
    } catch (err) {
      res.status(400).send()
    }

  })

  router.delete('/ad-accounts/:id', async (req, res) => {

    const id = req.params.id
    const deleted = await AdAccount
      .query()
      .where({id})
      .delete()

    if (!deleted) {
      return res.status(404).send()
    } else {
      res.send()
    }
  })

  router.get('/ad-campaigns', async (req, res) => {

    const orgs = await AdCampaign
      .query()

    res.send(orgs)

  })

  router.post('/ad-campaigns', async (req, res) => {

    const pkg = req.body
    try {
      const org = await AdCampaign
        .query()
        .insert(pkg)
      res.send(org)
    } catch (err) {
      res.status(400).send()
    }

  })

  router.delete('/ad-campaigns/:id', async (req, res) => {

    const id = req.params.id
    const deleted = await AdCampaign
      .query()
      .where({id})
      .delete()

    if (!deleted) {
      res.status(404).send()
    } else {
      res.send()
    }

  })

}
