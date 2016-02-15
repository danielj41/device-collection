angular.module('dozuki', [])
  .factory('Dozuki', ['$window', '$http', function($window, $http) {
    var Wrapper = function() {
      this.send = function(url, options) {
        var httpOptions = {
          url: url,
          method: options.method,
          headers: options.headers
        };
        // set url params for GET requests, otherwise send it as the body
        httpOptions[options.method == 'GET' ? 'data' : 'params'] = options.data;
        return $http(httpOptions).then(function(response) {
          return response.data;
        });
      }
    };

    return function(domain) {
      return new $window.Dozuki(domain, new Wrapper());
    };
  }]);
