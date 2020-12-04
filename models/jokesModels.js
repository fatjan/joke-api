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

module.exports = mongoose.model('Jokes', jokeDataSchema)
