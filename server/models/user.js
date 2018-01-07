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
  isVerified: {
        type: Boolean,
        default: false
    },
  passwordResetToken: String,
  keyGoogleAuthenticator: String,
  passwordResetExpires: Date,
  address: {
        type: String,
        required: true,
        unique: true
    },
  privateKey: {
        type: String,
        required: true,
        unique: true
    },
  publicKey: {
        type: String,
        required: true,
        unique: true
    },
  realMoney: {
        type: Number,
        default: 0
    },
  availableMoney: {
        type: Number,
        default: 0
    },
  addressWithdraw: {
        type: String,
        required: true,
        unique: true
    },
  privateKeyWithdraw: {
        type: String,
        required: true,
        unique: true
    },
  publicKeyWithdraw: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.methods.encryptPassword = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

UserSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
