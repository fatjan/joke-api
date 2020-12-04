require('dotenv').config()
const express = require('express')
const paginate = require('express-paginate')
const app = express()
const Jokes = require('./models/jokesModels')

app.get('/jokes/paginate', async (req, res, next) => {
  const amount = parseInt(req.query.limit)
  const page = parseInt(req.query.page)
  try {
    const [results, itemCount] = await Promise.all([
      Jokes.find({}).limit(amount).skip(req.skip).lean().exec(),
      Jokes.countDocuments({})
    ])

    const pageCount = Math.ceil(itemCount / amount)

    if (req.accepts('json')) {
    // inspired by Stripe's API response for list objects
      res.json({
        object: 'list',
        page: page,
        total_page: pageCount,
        total_item: itemCount,
        limit: amount,
        has_more: paginate.hasNextPages(req)(pageCount),
        data: results
      })
    } else {
      res.render('jokes', {
        jokes: results,
        pageCount,
        itemCount,
        pages: paginate.getArrayPages(req)(3, pageCount, page)
      })
    }
  } catch (err) {
    next(err)
  }
})

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())

const jokesRouter = require('./routes/jokesRouter')
app.use('/jokes', jokesRouter)

app.listen(3000, () => console.log('Server Started'))
