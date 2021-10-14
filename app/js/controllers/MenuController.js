'use strict';

foodMeApp.controller('MenuController',
    function MenuController($scope, $routeParams, Restaurant, cart, customer) {

  $scope.restaurant = Restaurant.get({id: $routeParams.restaurantId});
  $scope.cart = cart;

  
  newrelic.interaction().actionText("Menu");
  newrelic.interaction().setAttribute("user", customer.name);

  const r = Math.floor(Math.random()*100);
  if ( r < 5 ) {
    const err = new Error(`Error fetching menu for restaurant ${$routeParams.restaurantId} - ${r}`);
    newrelic.noticeError(err);
    throw err;
  }
});
