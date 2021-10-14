'use strict';

foodMeApp.controller('CheckoutController',
    function CheckoutController($scope, cart, customer, $location) {


  $scope.cart = cart;
  $scope.restaurantId = cart.restaurant.id;
  $scope.customer = customer;
  $scope.submitting = false;

	    
	    
  $scope.purchase = function() {
    if ($scope.submitting) return;

    $scope.submitting = true;


    cart.submitOrder().then(function(orderId) {
      // $location.path('thank-you').search({orderId: orderId});

      const r = Math.floor(Math.random()*100);

      newrelic.interaction().actionText("Checkout");
      newrelic.interaction().setAttribute("user", customer.name);
      newrelic.interaction().setAttribute("orderId", orderId);

      if ( r < 5 ) {
        const err = new Error(`order submit failed - ordId: ${orderId} - ${r}`);
        newrelic.noticeError(err);
        throw err;
      }
      else {
        $location.path('thank-you').search({orderId: orderId});
      }
    });
  };
});
