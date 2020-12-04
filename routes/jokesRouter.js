const express = require('express')
const axios = require('axios')
const router = express.Router()
const Jokes = require('../models/jokesModels')
const paginate = require('express-paginate')

const basicAPI = 'http://api.icndb.com/jokes/random/'

let obtainedJoke

for (let i = 0; i < 10; i++) {
  getRandomJoke().then(() => {
    storeRandomJoke(obtainedJoke)
  })
}

// fetch random joke data from API
async function getRandomJoke(res) {
  await axios.get(basicAPI)
    .then((response) => {
      obtainedJoke = response.data.value.joke
    })
}

// store random joke data from API to db storage
async function storeRandomJoke(jokeData) {
  try {
    const joke = new Jokes({
      joke: jokeData
    })
    const jokeStored = Jokes.find({ joke: joke.joke })
    // only save data that is unique (not exist in db yet)
    if (jokeStored != null) {
      await joke.save()
    }
  } catch (error) {
    console.log('This is error ', error)
  }
}

// API to get random jokes from other api
router.get('/from-api', async (req, res) => {
  try {
    await axios.get(basicAPI)
      .then((response) => {
        if (response.data.type === 'success') {
          const obtainedJoke = response.data.value.joke
          res.status(200).json({ message: 'SUCCESS', data: obtainedJoke })
        }
      })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// API to fetch new joke and save it to db storage
router.post('/', async (req, res) => {
  const amountRequest = req.body.amount
  const jokesObtained = []
  for (let i = 0; i < amountRequest; i++) {
    await getRandomJoke().then(() => {
      storeRandomJoke(obtainedJoke)
      jokesObtained.push(obtainedJoke)
    })
  }
  res.status(200).json({
    data: jokesObtained,
    message: 'SUCCESS',
    count: jokesObtained.length
  })
})

// get random jokes from database storage
router.get('/', async (req, res) => {
  try {
    const jokes = await Jokes.find()
    const countJokes = jokes.length
    res.status(200).json({ message: 'SUCCESS', count: countJokes, data: jokes })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// get random jokes from database storage
router.post('/all', async (req, res) => {
  // const num = parseInt(req.body.num)
  // const offsetData = parseInt(req.body.offset)
  try {
    const [results, itemCount] = await Promise.all([
      Jokes.find({}).limit(req.body.limit).skip(req.skip).lean().exec(),
      Jokes.count({})
    ])
    const pageCount = Math.ceil(itemCount / req.body.limit)
    if (req.accepts('json')) {
      // inspired by Stripe's API response for list objects
      res.json({
        object: 'list',
        has_more: paginate.hasNextPages(req)(pageCount),
        data: results
      })
    } else {
      res.render('jokes', {
        jokes: results,
        pageCount,
        itemCount,
        pages: paginate.getArrayPages(req)(3, pageCount, req.body.page)
      })
    }
  } catch (err) {
    res.status(400).send(err)
  }
})

// remove joke from database storage using its id
router.delete('/:id', getJoke, async (req, res) => {
  try {
    await res.joke.remove()
    res.status(200).json({ message: 'SUCCESS' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// get 10 random jokes from database storage
router.get('/many/:num', getAllJokes, async (req, res) => {
  try {
    const obtainedJokes = res.allJokes
    const number = parseInt(req.params.num)
    const jokesAmount = obtainedJokes.length
    const newJokes = []
    // const jokesLength = obtainedJokes.length
    for (let i = 0; i < number; i++) {
      const randomNum = Math.floor(Math.random() * jokesAmount)
      newJokes.push(obtainedJokes[randomNum])
    }
    const count = newJokes.length
    res.status(200).json({ message: 'SUCCESS', count: count, data: newJokes })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// getJoke to get a joke by its id
async function getJoke(req, res, next) {
  let joke
  try {
    joke = await Jokes.findById(req.params.id)
    if (joke == null) {
      // 404 means cannot find anything
      return res.status(404).json({ message: 'Cannot find the joke data.' })
    }
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }

  res.joke = joke
  next()
}

// delete all data from db
router.get('/delete-all', getAllJokes, async (req, res) => {
  const jokes = res.allJokes
  // gather all ids from getAll data
  const ids = []
  jokes.forEach((joke) => {
    ids.push(joke._id)
  })
  // then use deleteMany to delete all data from storage
  try {
    await Jokes.deleteMany({ _id: { $in: ids } })
    res.status(200).json({ message: 'SUCCESS DELETE ALL' })
  } catch (error) {
    res.status(400).json({ message: error })
  }
})

async function getAllJokes(req, res, next) {
  let jokes = []
  try {
    jokes = await Jokes.find()
  } catch (error) {
    console.log('Error get all jokes ', error)
  }
  res.allJokes = jokes
  next()
}

// get 10 random jokes from database storage
router.get('/analysis/:num', getAllJokes, async (req, res) => {
  try {
    const obtainedJokes = res.allJokes
    const number = parseInt(req.params.num)
    const jokesAmount = obtainedJokes.length
    const newJokes = []
    // const jokesLength = obtainedJokes.length
    for (let i = 0; i < number; i++) {
      const randomNum = Math.floor(Math.random() * jokesAmount)
      newJokes.push(obtainedJokes[randomNum])
    }
    const words = {}
    const jokesList = []
    newJokes.forEach((item) => {
      const jokeItem = item.joke
      jokesList.push(jokeItem)
      const jokeWords = jokeItem.split(' ')
      jokeWords.forEach((word) => {
        const cleanedWord = cleanWord(word)
        if (!(cleanedWord in words)) {
          words[cleanedWord] = 1
        } else {
          words[cleanedWord] += 1
        }
      })
    })
    const result = {
      jokes: jokesList,
      words: words
    }
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

const cleanWord = (word) => {
  let altered = word.replace('.', '')
  altered = altered.replace(',', '')
  altered = altered.replace(';', '')
  altered = altered.replace(')', '')
  altered = altered.replace('(', '')
  altered = altered.replace('&quot', '')
  altered = altered.replace('--', '')
  altered = altered.replace("'", '')
  return altered
}

module.exports = router
