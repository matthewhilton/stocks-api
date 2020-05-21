const express = require('express');
const router = express.Router();
const knex = require('../db.js')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");

// Config for tokens and password hashing
const saltRounds = 10;
const expires_in = 60 * 60 * 24 // 1 day

// Load external configurable responses
const errorResponse = require("../responses/error.json")
const successResponse = require('../responses/success.json')

router.post('/register', function(req, res, next) {
  // Ensure all headers exist
  const { email, password } = req.body;

  // No email or password in request body
  if(email == undefined || password == undefined){
    res.status(400).json({
      error: true,
      message: errorResponse.userFormBodyIncomplete
    })
    return;
  // Email or password are defined, but no data (incomplete)
  } else if(email == "" || password == ""){
    res.status(400).json({
      error: true,
      message: errorResponse.userFormBodyIncomplete
    })
    return;
  } else {
    // Else lookup email to see if already exists
    knex('users')
        .where({email: email})
        .then(rows => {
          if(rows.length != 0){
            res.status(409).json({
              error: true,
              message: errorResponse.userAlreadyExists
            })
            return;
          } else {
            bcrypt.hash(password, saltRounds, (err, hash) => {
              // Password hashed, insert into DB
              knex('users')
                  .insert({
                    email: email,
                    password: hash,
                  }).then(() => {
                    res.status(200).json({
                      success: true,
                      message: successResponse.userCreated
                    })
                    return;
                  })
                  .catch((e) => {
                    console.error(e)
                    // Unexpected error with knex/mysql
                    res.status(500)
                    return;
                  })
            })
          }
        })
  }

  // Should never reach here
  res.status(500)
});

router.post('/login', function(req, res, next) {
  const { email, password } = req.body;

  // No email or password in request body
  if(email == undefined || password == undefined){
    res.status(400).json({
      error: true,
      message: errorResponse.userFormBodyIncomplete
    })
    return;
    // Email or password are defined, but no data (incomplete)
  } else if(email == "" || password == ""){
    res.status(400).json({
      error: true,
      message: errorResponse.userFormBodyIncomplete
    })
    return;
  } else {
    knex('users')
        .where({email: email})
        .then(rows => {
          if(rows.length == 0){
            res.status(401).json({
              error: true,
              message: errorResponse.userNotFound
            })
            return;
          } else {
            // Compare password hash
            bcrypt.compare(password, rows[0].password, (err, result) => {
              if(result){
                // Password correct, generate JWT
                const exp = Math.floor(Date.now() / 1000) + expires_in
                const token = jwt.sign({ email, exp }, process.env.JWT_SECRET_KEY)
                res.status(200).json({
                  token_type: 'Bearer',
                  token,
                  expires_in
                })
                return;
              } else {
                res.status(401).json({
                  error: true,
                  message: errorResponse.incorrectPassword
                })
                return;
              }
            })
          }
        })
        .catch((e) => {
          console.error(e)
          // Unexpected error with knex/mysql
          res.status(500)
          return;
        })
  }

  // Should never reach here
  res.status(500)
});

module.exports = router;
