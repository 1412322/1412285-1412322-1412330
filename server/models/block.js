var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BlockSchema = new Schema({
  hash: {
        type: String,
        unique: true
    },
    nonce:{
      type: Number
    },
    version: {
      type: Number,
      default: 1
    },
    timestamp: {
      type: Number
    },
    difficulty: {
      type: Number
    },
    transactions:[
      {
        type:String
      }
    ],
    transactionsHash:{
      type:String
    },
    previousBlockHash:{
      type: String
    }
});

BlockSchema.statics.findPerPage = function(filter, offset, limit) {
	return this.find(filter).skip(offset).limit(limit);
};

module.exports = mongoose.model('Block', BlockSchema);
