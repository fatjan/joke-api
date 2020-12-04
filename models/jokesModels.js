const mongoose = require('mongoose')

const jokeDataSchema = new mongoose.Schema({
  joke: {
    type: String,
    required: true
  },
  categories: {
    type: String,
    required: false
  }
})

module.exports = mongoose.model('Jokes', jokeDataSchema)
