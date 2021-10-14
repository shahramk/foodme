'use strict';

foodMeApp.controller('CustomerController',
    function CustomerController($scope, customer, $location) {

  $scope.customerName = customer.name;
  $scope.customerAddress = customer.address;


  $scope.findRestaurants = function(customerName, customerAddress) {
    customer.name = customerName;
    customer.address = customerAddress;


    newrelic.interaction().actionText("Customer");
    newrelic.interaction().setAttribute("user", customer.name);

    const r = Math.floor(Math.random()*100);
    if ( r < 5 ) {
      const err = new Error(`Error obtaining customer details - ${r}`);
      newrelic.noticeError(err);
      throw err;
    }
    else {
      $location.url('/');
    }
  };
});
