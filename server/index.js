var newrelic = require('newrelic');
var express = require('express');
var fs = require('fs');
var open = require('open');

var RestaurantRecord = require('./model').Restaurant;
var MemoryStorage = require('./storage').Memory;
const { resolveMx } = require('dns');

var API_URL = '/api/restaurant';
var API_URL_ID = API_URL + '/:id';
var API_URL_ORDER = '/api/order';

var removeMenuItems = function(restaurant) {
  var clone = {};

  Object.getOwnPropertyNames(restaurant).forEach(function(key) {
    if (key !== 'menuItems') {
      clone[key] = restaurant[key];
    }
  });

  return clone;
};


exports.start = function(PORT, STATIC_DIR, DATA_FILE, TEST_DIR) {
  var app = express();
  var storage = new MemoryStorage();

  // log requests
  app.use(express.logger('dev'));

  // serve static files for demo client
  app.use(express.static(STATIC_DIR));

  // parse body into req.body
  app.use(express.bodyParser());


  // API
  // GET /api/restaurant
  
  app.get(API_URL, function(req, res, next) {
    const r = Math.floor(Math.random()*100);
    if ( r < 5 ) { // % of fake errors
      const message = "404 - failed to fetch restaurant list";
      const err = new Error(message);
      newrelic.noticeError(err);
      return res.send(500, {error: err});
    }
    else {
      return res.send(200, storage.getAll().map(removeMenuItems));
    }
  });

  // POST /api/restaurant
  app.post(API_URL, function(req, res, next) {
    var restaurant = new RestaurantRecord(req.body);
    var errors = [];

    const r = Math.floor(Math.random()*100);
    if ( r < 5 ) { // % of fake errors
      const message = "400 - bad request - failed to update restaurants";
      const err = new Error(message);
      newrelic.noticeError(err);
      return res.send(400, {error: err});
    }
    else {
      if (restaurant.validate(errors)) {
        storage.add(restaurant);
        return res.send(201, restaurant);
      }
      return res.send(400, {error: errors});
    }

    
  });

  // POST /api/order
  app.post(API_URL_ORDER, function(req, res, next) {
    console.log(`${new Date().getTime().toString()}`);
    console.log(req.body);
    const r = Math.floor(Math.random()*100);
    if ( r < 5 ) { // % of fake errors
      const message = "401 - failed to write order";
      const err = new Error(message);
      newrelic.noticeError(err);
      res.send(401, {error: err});
    }
    else {
      return res.send(201, { orderId: Date.now()});
    }
  });

  // GET /api/restaurant
  app.get(API_URL_ID, function(req, res, next) {
    var restaurant = storage.getById(req.params.id);

    const r = Math.floor(Math.random()*100);
    if ( r < 5 ) { // % of fake errors
      const message = `400 - No restaurant with id "${req.params.id}"!`;
      const err = new Error(message);
      newrelic.noticeError(err);
      res.send(400, {error: err});
    }
    else {
      if (restaurant) {
        return res.send(200, restaurant);
      }
      return res.send(400, `No restaurant with id "${req.params.id}"!`);
    }
  });

  // PUT /api/restaurant
  app.put(API_URL_ID, function(req, res, next) {
    var restaurant = storage.getById(req.params.id);
    var errors = [];

    if (restaurant) {
      restaurant.update(req.body);
      return res.send(200, restaurant);
    }

    restaurant = new RestaurantRecord(req.body);
    if (restaurant.validate(errors)) {
      storage.add(restaurant);
      return res.send(201, restaurant);
    }

    return res.send(400, {error: errors});
  });

  // DELETE /api/restaurant
  app.delete(API_URL_ID, function(req, res, next) {
    if (storage.deleteById(req.params.id)) {
      return res.send(204, null);
    }

    return res.send(400, {error: 'No restaurant with id "' + req.params.id + '"!'});
  });


  // only for running e2e tests
  app.use('/test/', express.static(TEST_DIR));


  // start the server
  // read the data from json and start the server
  fs.readFile(DATA_FILE, function(err, data) {
    JSON.parse(data).forEach(function(restaurant) {
      storage.add(new RestaurantRecord(restaurant));
    });

    app.listen(PORT, function() {
      open('http://localhost:' + PORT + '/');
      console.log('Go to http://localhost:' + PORT + '/');
      console.log(`starting the server: ${new Date().toLocaleString()}`)

    });
  });


  // Windows and Node.js before 0.8.9 would crash
  // https://github.com/joyent/node/issues/1553
  try {
    process.on('SIGINT', function() {
      // save the storage back to the json file
      fs.writeFile(DATA_FILE, JSON.stringify(storage.getAll()), function() {
        process.exit(0);
      });
    });
  } catch (e) {}

};
