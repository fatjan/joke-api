const express = require('express')
const axios = require('axios')
const router = express.Router()
const Jokes = require('../models/jokesModels')

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
    await joke.save()
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

// API to create new joke and save it to db storage
router.post('/', async (req, res) => {
  const joke = new Jokes({
    joke: req.body.joke
  })
  try {
    const newJokeCreated = await joke.save()
    // 201 means sucessfully created
    res.status(201).json({ message: 'SUCCESS', data: newJokeCreated })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// get random jokes from database storage
router.get('/', async (req, res) => {
  try {
    const jokes = await Jokes.find()
    res.status(200).json({ message: 'SUCCESS', data: jokes })
  } catch (error) {
    res.status(500).json({ message: error.message })
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
    console.log('ini number ', number)
    console.log('ini obtainedJokes ', obtainedJokes)
    const newJokes = []
    const jokesLength = obtainedJokes.length
    for (let i = 0; i < number; i++) {
      const randomNum = Math.floor(Math.random() * jokesLength)
      newJokes.push(obtainedJokes[randomNum])
    }
    const count = newJokes.length
    res.status(200).json({ message: 'SUCCESS', count: count, data: newJokes })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})


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

async function getAllJokes(req, res, next) {
  let allJokes = []
  try {
    allJokes = await Jokes.find()
  } catch (error) {
    console.log('Error get all jokes ', error)
  }

  res.allJokes = allJokes
  next()
}

module.exports = router
