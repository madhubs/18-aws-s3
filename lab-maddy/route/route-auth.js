'use strict';

const jsonParser = require('body-parser').json()
const debug = require('debug')('cfgram:route-auth');
const errorHandler = require('../lib/error-handler');
const basicAuth = require('../lib/basic-auth-middleware');
const User = require('../model/user');

module.exports = function(router) {
  router.post('/api/signup', jsonParser, (req, res) => {
    debug('POST /api/signup');

    // get rid of the PW on req.body before the req is handed back as a nested object in the res
    let pw = req.body.password;
    delete req.body.password;

    let user = new User(req.body);//changed from newUser to just user

    user.generatePasswordHash(pw)
    // user => { username: 'x', password: 'encrypted', email: 'x@x.com' }
      .then(user => user.save())
      .then(user => user.generateToken())
      .then(token => res.status(201).send(token))
      .catch(err => errorHandler(err, req, res));
  });

  router.get('/api/signin', basicAuth, (req, res, next) => {
    debug('GET /api/signin');

    return User.findOne({ username: req.auth.username })
      .then(user => user.comparePasswordHash(req.auth.password))
      .then(user => user.generateToken())
      .then(token => res.send(token))
      .catch(err => errorHandler(err, req, res));
  });
};
