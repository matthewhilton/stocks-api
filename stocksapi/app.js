const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const https = require('https');
const http = require('http');
const fs = require('fs');
const cors = require('cors')

// Setup Swagger and load config from .yaml file
const swaggerUI =  require('swagger-ui-express');
const yaml = require('yamljs')
const swaggerDocument = yaml.load('./swagger.yaml')

// Initialise environment variables
const dotenv = require('dotenv')
dotenv.config();

// Setup routers in external files
const usersRouter = require('./routes/users');
const stocksRouter = require('./routes/stocks');

// Load knex (incl. connecting to db) and express
const app = express();
const knex = require('./db.js')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Setting up middleware
app.use(helmet())
app.use(logger('dev'));
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routing
app.use('/user', usersRouter);
app.use('/stocks', stocksRouter);
app.use('/', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Create servers
const httpServer = http.createServer(app);
httpServer.listen(process.env.PORT)

if(process.env.USE_HTTPS == 'true'){
  // Read certificate from path in environment variables
  const privateKey = fs.readFileSync(process.env.SSL_CERT_KEY, 'utf8');
  const certificate = fs.readFileSync(process.env.SSL_CERT_CRT, 'utf8');
  const credentials = {key: privateKey, cert: certificate};

  // Listen on https serving this certificate
  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(process.env.HTTPS_PORT)
}



module.exports = app;
