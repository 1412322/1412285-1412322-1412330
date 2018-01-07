var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
  email: {
        type: String,
        unique: true,
        required: true
    },
  password: {
        type: String,
        required: true
    },
  role: String,
  isVerified: {
        type: Boolean,
        default: false
    },
  passwordResetToken: String,
  keyGoogleAuthenticator: String,
  passwordResetExpires: Date,
  address: String,
  privateKey: String,
  publicKey: String,
  realMoney: {
        type: Number,
        default: 0
    },
  availableMoney: {
        type: Number,
        default: 0
    },
    addressWithdraw: String,
    privateKeyWithdraw: String,
    publicKeyWithdraw: String
});

UserSchema.methods.encryptPassword = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

UserSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
