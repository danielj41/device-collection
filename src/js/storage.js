angular.module('storage', [])
  .factory('PersistentList', ['$q', '$window', function($q, $window) {

    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
    var storage;

    try {
      storage = $window.localStorage,
        x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
    }
    catch(e) {
      // if localStorage is not available, make the page usable but
      // not persistent.
      storage = {};
    }

    // List constructor, with a namespace
    // and a toJSON filter for saving item data
    var List = function(name, toJSON) {
      this.name = 'PersistentList_' + name;
      this.itemToJSON = toJSON;
      this.data = [];
    };

    // standard list methods
    List.prototype.getArray = function() {
      return this.data.slice();
    };

    List.prototype.setData = function(data) {
      var list = this;
      data.forEach(function(item) {
        item.toJSON = list.itemToJSON;
      });
      this.data = data;
      return this;
    };

    List.prototype.insert = function(item, index) {
      item.toJSON = this.itemToJSON;
      this.data.splice(index || this.data.length, 0, item); 
      return this; // allows chaining
    };

    List.prototype.remove = function(index) {
      this.data.splice(index, 1);
      return this;
    };


    // persists the current state of the list, and returns an array of the
    // list's data after successfully saving it.
    List.prototype.save = function() {
      storage[this.name] = $window.JSON.stringify(this.data);
      // return a promise, so we can replace it with async storage without
      // changing this interface
      return $q.resolve(this.getArray());
    };
    // expected usage:
    // myList.insert(-1, myItem).remove(4).save().then(...)


    // usage: PersistentList(...).then(function(yourNewList){...})
    return function(name, toJSON, filter) {
      var list = new List(name, toJSON);

      // load previously saved data if it can be parsed
      try {
        if(storage[list.name]) {
          // filter is for custom parsing, so the user can add additional
          // attributes on load.
          list.setData(filter($window.JSON.parse(storage[list.name])));
        }
      } catch(e) {
        // any problems loading it, just reset local storage
        delete storage[list.name];
      }

      return $q.resolve(list);
    };
  }]);
