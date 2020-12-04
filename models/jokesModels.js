const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

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

jokeDataSchema.plugin(mongoosePaginate)

// const Joke = mongoose.model('Joke', jokeDataSchema)

// Joke.paginate(query, options)
//   .then(result => {})
//   .catch(error => {})

module.exports = mongoose.model('Jokes', jokeDataSchema)
