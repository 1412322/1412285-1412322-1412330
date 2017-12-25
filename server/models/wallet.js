var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WalletSchema = new Schema({
  email: {
        type: String,
        unique: true,
        required: true
    },
  money: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Wallet', WalletSchema);
