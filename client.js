/**
 * This file contains a bunch of HTTP requests that use the
 * API defined in api.js.
 */

const Promise = require('bluebird')
const axios = require('axios')
const assert = require('assert')

const req = axios.create({
  baseURL: 'http://localhost:8641/'
})

Promise.coroutine(function*() {

  const org1 = yield req.post('organizations', {
    title: 'Org 1',
  })

  console.log('\ninserted', org1.data)

  assert(org1.data.id)
  assert.strictEqual(org1.data.title, 'Org 1')

  const app1 = yield req.post('applications', {
    title: 'App 1',
    organizationId: org1.data.id
  })

  console.log('\ninserted', app1.data)

  assert(app1.data.id)
  assert.strictEqual(app1.data.title, 'App 1')

  const tom = yield req.post('users', {
    firstName: 'Tom',
    lastName: 'Watson',
  })

  console.log('\ninserted', tom.data)

  assert(tom.data.id)
  assert.strictEqual(tom.data.firstName, 'Tom')
  assert.strictEqual(tom.data.lastName, 'Watson')

  const chris = yield req.post('users', {
    firstName: 'Chris',
    lastName: 'Abrams',
  })

  console.log('\ninserted', chris.data)

  assert(chris.data.id)
  assert.strictEqual(chris.data.firstName, 'Chris')
  assert.strictEqual(chris.data.lastName, 'Abrams')

  const cat1 = yield req.post('categories', {
    title: 'cat1',
  })

  console.log('\ninserted', cat1.data)

  assert(cat1.data.id)
  assert.strictEqual(cat1.data.title, 'cat1')

  const cat2 = yield req.post('categories', {
    title: 'cat2',
  })

  console.log('\ninserted', cat2.data)

  assert(cat2.data.id)
  assert.strictEqual(cat2.data.title, 'cat2')

  const doc1 = yield req.post('documents', {
    organizationId: org1.data.id,
    applicationId: app1.data.id,
    userId: tom.data.id,
    title: 'Tom First Doc',
    body: 'Some text',
    slug: 'tom-first-doc',
    status: 'published',
    tags: ['humor', 'cats'],
    categoryIds: [cat1.data.id, cat2.data.id]
  })

  console.log('\ninserted', doc1.data)

  assert(doc1.data.id)
  assert.strictEqual(doc1.data.organizationId, org1.data.id)
  assert.strictEqual(doc1.data.applicationId, app1.data.id)
  assert.strictEqual(doc1.data.userId, tom.data.id)
  assert.strictEqual(doc1.data.title, 'Tom First Doc')
  assert.strictEqual(doc1.data.slug, 'tom-first-doc')
  assert.strictEqual(doc1.data.body, 'Some text')
  assert.strictEqual(doc1.data.status, 'published')
  assert.deepStrictEqual(doc1.data.tags, ['humor', 'cats'])
  assert.strictEqual(doc1.data.author.id, tom.data.id)
  assert.strictEqual(doc1.data.author.firstName, tom.data.firstName)
  assert.strictEqual(doc1.data.categories.length, 2)
  assert.strictEqual(doc1.data.categories[0].id, cat1.data.id)
  assert.strictEqual(doc1.data.categories[0].title, 'cat1')
  assert.strictEqual(doc1.data.categories[1].id, cat2.data.id)
  assert.strictEqual(doc1.data.categories[1].title, 'cat2')

  const doc2 = yield req.post('documents', {
    organizationId: org1.data.id,
    applicationId: app1.data.id,
    userId: tom.data.id,
    title: 'Tom Second Doc',
    body: 'Some text',
    slug: 'tom-second-doc',
    status: 'draft',
    tags: ['humor', 'dogs'],
    categoryIds: [cat1.data.id]
  })

  console.log('\ninserted', doc2.data)

  assert(doc2.data.id)
  assert.strictEqual(doc2.data.organizationId, org1.data.id)
  assert.strictEqual(doc2.data.applicationId, app1.data.id)
  assert.strictEqual(doc2.data.userId, tom.data.id)
  assert.strictEqual(doc2.data.title, 'Tom Second Doc')
  assert.strictEqual(doc2.data.slug, 'tom-second-doc')
  assert.strictEqual(doc2.data.body, 'Some text')
  assert.strictEqual(doc2.data.status, 'draft')
  assert.deepStrictEqual(doc2.data.tags, ['humor', 'dogs'])
  assert.strictEqual(doc2.data.author.id, tom.data.id)
  assert.strictEqual(doc2.data.author.firstName, tom.data.firstName)
  assert.strictEqual(doc2.data.categories.length, 1)
  assert.strictEqual(doc2.data.categories[0].id, cat1.data.id)
  assert.strictEqual(doc2.data.categories[0].title, 'cat1')

  const doc3 = yield req.post('documents', {
    organizationId: org1.data.id,
    applicationId: app1.data.id,
    userId: chris.data.id,
    title: 'Chris First Doc',
    body: 'Some text',
    slug: 'chris-first-doc',
    status: 'published',
    categoryIds: [cat2.data.id]
  })

  console.log('\ninserted', doc3.data)

  assert(doc3.data.id)
  assert.strictEqual(doc3.data.organizationId, org1.data.id)
  assert.strictEqual(doc3.data.applicationId, app1.data.id)
  assert.strictEqual(doc3.data.userId, chris.data.id)
  assert.strictEqual(doc3.data.title, 'Chris First Doc')
  assert.strictEqual(doc3.data.slug, 'chris-first-doc')
  assert.strictEqual(doc3.data.body, 'Some text')
  assert.strictEqual(doc3.data.status, 'published')
  assert.strictEqual(doc3.data.tags, null)
  assert.strictEqual(doc3.data.author.id, chris.data.id)
  assert.strictEqual(doc3.data.author.firstName, chris.data.firstName)
  assert.strictEqual(doc3.data.categories.length, 1)
  assert.strictEqual(doc3.data.categories[0].id, cat2.data.id)
  assert.strictEqual(doc3.data.categories[0].title, 'cat2')

  let allTomsDocs = yield req.get(`users/${tom.data.id}/documents`)

  console.log('\nall toms docs', allTomsDocs.data)

  assert.strictEqual(allTomsDocs.data.length, 2)
  assert.strictEqual(allTomsDocs.data[0].id, doc1.data.id)
  assert.strictEqual(allTomsDocs.data[0].author.id, tom.data.id)
  assert.strictEqual(allTomsDocs.data[1].id, doc2.data.id)
  assert.strictEqual(allTomsDocs.data[1].author.id, tom.data.id)

  let tomsPublishedDocs = yield req.get(`users/${tom.data.id}/documents`, {
    params: {
      status: 'published'
    }
  })

  console.log('\ntoms published docs', JSON.stringify(tomsPublishedDocs.data, null, 2))

  assert.strictEqual(tomsPublishedDocs.data.length, 1)
  assert.strictEqual(tomsPublishedDocs.data[0].id, doc1.data.id)
  assert.strictEqual(tomsPublishedDocs.data[0].author.id, tom.data.id)

  let allDocs = yield req.get(`documents`, {
    params: {
      organizationId: org1.data.id,
      applicationId: app1.data.id,
    }
  })

  console.log('\nall docs', JSON.stringify(allDocs.data, null, 2))

  assert.strictEqual(allDocs.data.length, 3)

  let allDocsIgnoreDoc1 = yield req.get(`documents`, {
    params: {
      organizationId: org1.data.id,
      applicationId: app1.data.id,
      ignoreDocumentIds: [doc1.data.id]
    }
  })

  console.log('\nall docs ignoring doc1', JSON.stringify(allDocsIgnoreDoc1.data, null, 2))

  assert.strictEqual(allDocsIgnoreDoc1.data.length, 2)
  assert.strictEqual(allDocsIgnoreDoc1.data[0].id, doc2.data.id)
  assert.strictEqual(allDocsIgnoreDoc1.data[1].id, doc3.data.id)

  let allDocsByTom = yield req.get(`documents`, {
    params: {
      organizationId: org1.data.id,
      applicationId: app1.data.id,
      userId: tom.data.id
    }
  })

  console.log('\nall docs by tom', JSON.stringify(allDocsByTom.data, null, 2))

  assert.strictEqual(allDocsByTom.data.length, 2)
  assert.strictEqual(allDocsByTom.data[0].id, doc1.data.id)
  assert.strictEqual(allDocsByTom.data[1].id, doc2.data.id)

  let allPublishedDocsByTom = yield req.get(`documents`, {
    params: {
      organizationId: org1.data.id,
      applicationId: app1.data.id,
      userId: tom.data.id,
      status: 'published'
    }
  })

  console.log('\nall published docs by tom', JSON.stringify(allPublishedDocsByTom.data, null, 2))

  assert.strictEqual(allPublishedDocsByTom.data.length, 1)
  assert.strictEqual(allPublishedDocsByTom.data[0].id, doc1.data.id)

  let allDocsWithFirst = yield req.get(`documents`, {
    params: {
      organizationId: org1.data.id,
      applicationId: app1.data.id,
      title: 'first'
    }
  })

  console.log('\nall docs with title like first', JSON.stringify(allDocsWithFirst.data, null, 2))

  assert.strictEqual(allDocsWithFirst.data.length, 2)
  assert.strictEqual(allDocsWithFirst.data[0].id, doc1.data.id)
  assert.strictEqual(allDocsWithFirst.data[1].id, doc3.data.id)

  let allDocsWithCat1 = yield req.get(`documents`, {
    params: {
      organizationId: org1.data.id,
      applicationId: app1.data.id,
      categoryIds: [cat1.data.id]
    }
  })

  console.log('\nall docs with with cat1', JSON.stringify(allDocsWithCat1.data, null, 2))

  assert.strictEqual(allDocsWithCat1.data.length, 2)
  assert.strictEqual(allDocsWithCat1.data[0].id, doc1.data.id)
  assert.strictEqual(allDocsWithCat1.data[1].id, doc2.data.id)

  let allDocsWithCat1andCat2 = yield req.get(`documents`, {
    params: {
      organizationId: org1.data.id,
      applicationId: app1.data.id,
      categoryIds: [cat1.data.id, cat2.data.id]
    }
  })

  console.log('\nall docs with with cat1 and cat2', JSON.stringify(allDocsWithCat1andCat2.data, null, 2))

  assert.strictEqual(allDocsWithCat1andCat2.data.length, 1)
  assert.strictEqual(allDocsWithCat1andCat2.data[0].id, doc1.data.id)

})()
