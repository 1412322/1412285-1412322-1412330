var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ExchangeSchema = new Schema({
  send: {
        type: String,
        required: true
    },
    receive: {
          type: String,
          required: true
      },
  money: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Exchange', ExchangeSchema);
