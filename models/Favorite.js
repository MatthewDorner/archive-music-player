//models/Favorite.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var favoriteSchema = new Schema({
  username: String,
  favoriteRecord: String
});

module.exports = mongoose.model('Favorite', favoriteSchema);
