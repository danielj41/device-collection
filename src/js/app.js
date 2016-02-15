angular.module('deviceApp', ['storage', 'ngRoute', 'dozuki'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {
        controller: 'DeviceCollectionController as devices',
        templateUrl: 'view/collection.html',
        resolve: {
          devices: ['deviceListFactory', function(deviceListFactory) {
            // load the list of devices before rendering the main view
            return deviceListFactory;
          }]
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  }])


  .factory('deviceListFactory', ['Dozuki', 'PersistentList',
  function(Dozuki, PersistentList) {
    var api = Dozuki('www.ifixit.com');

    // function for transforming an API response to the format for this app
    var itemFromResponse = function(response) {
      return {
        id: encodeURIComponent(response.namespace) + '/' + encodeURIComponent(response.title),
        namespace: response.namespace,
        title: response.title,
        display_title: response.display_title,
        image: response.image
      };
    };

    // load devices from client storage
    return PersistentList('devices', function() {
      // set filter for saving device data to client storage
      return { 
        namespace: this.namespace,
        title: this.title
      };
    }, function(items) {
      // custom load filter
      items.forEach(function(item) {
        // fetch full information for each item user owns
        if(item.namespace === undefined || item.title === undefined) {
          throw new Error('incorrect storage format');
        }
        item.id = encodeURIComponent(item.namespace) + '/' + encodeURIComponent(item.title);
        api.wikis.get(item.namespace, item.title).then(function(response) {
          angular.extend(item, itemFromResponse(response));
        });
      });
      return items;
    }).then(function(list) {
      return {
        list: list,
        itemFromResponse: itemFromResponse,
        api: api
      };
    });
  }])


  .controller('DeviceCollectionController', ['devices', '$location', '$scope',
  function(devices, $location, $scope) {
    var controller = this;

    var initialize = function() {
      setViewModel(devices.list.getArray());
      controller.results = [];
      runSearchQuery();
    };

    // if the page was loaded with a query parameter q, then search
    var runSearchQuery = function() {
      controller.searchQuery = $location.search().q;
      controller.isSearching = false;
      if(controller.searchQuery) {
        controller.isSearching = true;
        devices.api.suggest.get(controller.searchQuery, 'device', 10, 0).then(function(response) {
          controller.results = response.results.map(function(result) {
            return devices.itemFromResponse(result);
          });
        }, function() {
          // error handling here
        });
      }
    };

    // when the devices.list updates, get the data for the view
    // (list for displaying in order, and the set for checking if a specific
    //  device has been selected)
    var setViewModel = function(list) {
      controller.viewModelList = list;
      controller.viewModelSet = {};
      list.forEach(function(item) {
        controller.viewModelSet[item.namespace] = controller.viewModelSet[item.namespace] || {};
        controller.viewModelSet[item.namespace][item.title] = true;
      });
    };

    controller.add = function(item) {
      devices.list.insert(item).save().then(setViewModel);
    };

    controller.remove = function(index) {
      devices.list.remove(index).save().then(setViewModel);
    };

    controller.removeById = function(namespace, title) {
      var index;
      if(controller.viewModelList.some(function(item, i) {
        if(item.namespace == namespace && item.title == title) {
          index = i;
          return true;
        }
        return false;
      })) {
        controller.remove(index);
      }
    };

    controller.search = function(query) {
      $location.search({q: query});
    };

    controller.endSearch = function() {
      $location.search({q: null});
    };

    initialize();
  }]);
