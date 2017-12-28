var User = require ('../models/user');

module.exports = {
  'verifyInfo': {
      verificationURL: '/api/users/email-verification/${URL}',
      persistentUserModel: User,
      tempUserCollection: 'myawesomewebsite_tempusers',

      transportOptions: {
          service: 'Gmail',
          auth: {
              user: 'mymy010196@gmail.com',
              pass: 'My010196'
          }
      },
      verifyMailOptions: {
          from: 'Do Not Reply <mymy010196@gmail.com>',
          subject: 'Please confirm account',
          html: 'Click the following link to confirm your account:</p><p>${URL}</p>',
          text: 'Please confirm your account by clicking the following link: ${URL}'
      }
  }
};
