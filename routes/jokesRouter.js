const express = require('express')
const axios = require('axios')
const router = express.Router()
const Jokes = require('../models/jokesModels')

const basicAPI = 'http://api.icndb.com/jokes/random/'

// get random jokes from other api
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
// create new unique joke and save it to db storage
router.post('/', async (req, res) => {
  const joke = new Jokes({
    joke: req.body.joke
  })
  try {
    const newJokeCreated = await joke.save()
    // 201 means sucessfully created
    res.status(201).json(newJokeCreated)
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
// remove all jokes from database storage

// get 10 random jokes from database storage

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

module.exports = router
