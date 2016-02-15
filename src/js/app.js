angular.module('deviceApp', ['storage', 'ngRoute', 'dozuki'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {
        controller: 'DeviceCollectionController as devices',
        templateUrl: 'view/collection.html',
        resolve: {
          deviceList: ['PersistentList', function(PersistentList) {
            // load the list of devices before rendering the main view
            return PersistentList('devices', function(item) {
              return {
                wikiid: item.wikiid,
                title: item.title
              }; // only save the ids and titles
            });
          }]
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  }])
  .controller('DeviceCollectionController', ['deviceList', 'Dozuki',
  function(deviceList, Dozuki) {
    var controller = this;
    var dozuki = Dozuki('www.ifixit.com');

    var initialize = function() {
      setViewModel(deviceList.getArray());
      controller.results = [];
    };

    // when the deviceList updates, get the data for the view
    // (list for displaying in order, and the set for checking if a specific
    //  device has been selected)
    var setViewModel = function(list) {
      controller.viewModelList = list;
      controller.viewModelSet = {};
      list.forEach(function(item, index) {
        controller.viewModelSet['' + item.wikiid] = true;
      });
    };

    controller.add = function(result) {
      deviceList.insert({
        wikiid: result.wikiid,
        title: result.title
      }).save().then(setViewModel);
    };

    controller.remove = function(index) {
      deviceList.remove(index).save().then(setViewModel);
    };

    controller.removeById = function(wikiid) {
      var index;
      if(controller.viewModelList.some(function(item, i) {
        if(item.wikiid == wikiid) {
          index = i;
          return true;
        }
        return false;
      })) {
        controller.remove(index);
      }
    };

    controller.search = function(query) {
      dozuki.suggest.get(query, 'device', 10, 0).then(function(response) {
        controller.results = response.results;
      }, function() {
        // error handling here
      });
    };

    initialize();
  }]);
