var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var nBlocksSchema = new Schema({
  value: {
        type: Number
    }
});

module.exports = mongoose.model('nBlocks', nBlocksSchema);
