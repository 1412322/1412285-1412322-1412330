var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
  hash: {
        type: String,
        unique: true
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

module.exports = mongoose.model('Transaction', TransactionSchema);
