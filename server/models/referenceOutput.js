var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var ReferenceOutputSchema = new Schema({
  referencedOutputHash: {
        type: String,
        required: true
    },
  referencedOutputIndex: {
        type: Number,
        required: true
    },
  address: {
        type: String,
        required: true
    },
  money: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('ReferenceOutput', ReferenceOutputSchema);
