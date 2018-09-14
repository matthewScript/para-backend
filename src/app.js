import morgan from 'morgan'
import express from 'express'
import bodyParser from 'body-parser'
import promiseRouter from 'express-promise-router'
import registerApi from './api'

require('./db')

const router = promiseRouter()
const app = express()
  .use(bodyParser.json())
  .use(morgan('dev'))
  .use(router)
  .set('json spaces', 2)

registerApi(router)

const server = app.listen(8641, () => {
  console.log('Example app listening at port %s', server.address().port)
})

export default server
