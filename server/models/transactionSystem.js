var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransactionSystemSchema = new Schema({
  hash: {
        type: String,
        unique: true
    },
  timestamp: {
    type: Number
  },
  inputs:[
    {
      unlockScript:{
        type: String
      },
      referencedOutputHash:{
        type: String
      },
      referencedOutputIndex:{
        type: Number
      }
    }
  ],
  outputs:[
    {
      value:{
        type: Number
      },
      lockScript:{
        type: String
      }
    }
  ],
  version:{
    type: Number,
    default: 1
  },
  state:{
    type: String
  },
  auth:{
    type: String,
    default:null
  }
});

/*TransactionSystemSchema.statics.findPerPage = function(filter, offset, limit) {
	return this.find(filter).skip(offset).limit(limit);
};*/

module.exports = mongoose.model('TransactionSystem', TransactionSystemSchema);
