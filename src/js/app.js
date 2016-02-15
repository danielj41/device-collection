angular.module('deviceApp', ['storage', 'ngRoute'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {
        controller: 'DeviceCollectionController as devices',
        templateUrl: 'view/collection.html',
        resolve: {
          deviceList: ['PersistentList', function(PersistentList) {
            // load the list of devices before rendering the main view
            return PersistentList('devices', function(item) {
              return {id: item.id}; // only save the ids
            });
          }]
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  }])
  .controller('DeviceCollectionController', ['deviceList', function(deviceList) {
    var controller = this;

    controller.viewModel = deviceList.getArray();
    var setViewModel = function(viewModel) {
      controller.viewModel = viewModel;
    };

    controller.add = function(text) {
      deviceList.insert({id: text}).save().then(setViewModel);
    };

    controller.remove = function(index) {
      deviceList.remove(index).save().then(setViewModel);
    }
  }]);
