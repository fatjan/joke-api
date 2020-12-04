const express = require('express')
const axios = require('axios')
const router = express.Router()

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
// create 10 new unique jokes == store the obtained jokes to database

// get 5 random jokes from database storage

// remove all jokes from database storage

// get 10 random jokes from database storage

module.exports = router

