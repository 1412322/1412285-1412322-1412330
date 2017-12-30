var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AddressSchema = new Schema({
  userID: {
        type: String,
        unique: true,
        required: true
    },
  address: {
        type: String,
        required: true
    },
  privateKey: {
        type: String,
        required: true
    },
  publicKey: {
        type: String,
        required: true
    },
  money: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('Address', AddressSchema);
