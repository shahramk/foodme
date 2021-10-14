'use strict';

foodMeApp.controller('ThankYouController', function ThankYouController($scope, $routeParams, customer) {
  $scope.orderId = $routeParams.orderId;

  newrelic.interaction().actionText("Thank you");
  newrelic.interaction().setAttribute("user", customer.name);
  newrelic.interaction().setAttribute("orderId", $scope.orderId);

});
