angular.module("deviceApp",["storage","ngRoute","dozuki","ngAnimate"]).config(["$routeProvider","$animateProvider",function($routeProvider,$animateProvider){$routeProvider.when("/",{controller:"DeviceCollectionController as devices",templateUrl:"view/collection.html",resolve:{devices:["deviceListFactory",function(deviceListFactory){return deviceListFactory}]}}).otherwise({redirectTo:"/"});$animateProvider.classNameFilter(/animate-/)}]).factory("deviceListFactory",["Dozuki","PersistentList",function(Dozuki,PersistentList){var api=Dozuki("www.ifixit.com");var itemFromResponse=function(response){return{id:encodeURIComponent(response.namespace)+"/"+encodeURIComponent(response.title),namespace:response.namespace,title:response.title,display_title:response.display_title,image:response.image}};return PersistentList("devices",function(){return{namespace:this.namespace,title:this.title}},function(items){items.forEach(function(item){if(item.namespace===undefined||item.title===undefined){throw new Error("incorrect storage format")}item.id=encodeURIComponent(item.namespace)+"/"+encodeURIComponent(item.title);api.wikis.get(item.namespace,item.title).then(function(response){angular.extend(item,itemFromResponse(response))})});return items}).then(function(list){return{list:list,itemFromResponse:itemFromResponse,api:api}})}]).controller("DeviceCollectionController",["devices","$location","$scope","$window",function(devices,$location,$scope,$window){var controller=this;var initialize=function(){setViewModel(devices.list.getArray());controller.results=[];runSearchQuery()};var runSearchQuery=function(){controller.searchQuery=$location.search().q;controller.isSearching=false;if(controller.searchQuery){controller.isSearching=true;devices.api.suggest.get(controller.searchQuery,"device",10,0).then(function(response){controller.results=response.results.map(function(result){return devices.itemFromResponse(result)})},function(){})}};var setViewModel=function(list){controller.viewModelList=list;controller.viewModelSet={};list.forEach(function(item){controller.viewModelSet[item.id]=true})};controller.add=function(item){devices.list.insert(item).save().then(setViewModel)};controller.remove=function(index){devices.list.remove(index).save().then(setViewModel)};controller.removeById=function(namespace,title){var index;if(controller.viewModelList.some(function(item,i){if(item.namespace==namespace&&item.title==title){index=i;return true}return false})){controller.remove(index)}};controller.search=function($event,query){$event.preventDefault();$event.stopPropagation();$location.search({q:query});$window.scrollTo(0,0)};controller.endSearch=function(){$location.search({q:null});$window.scrollTo(0,0)};initialize()}]);angular.module("dozuki",[]).factory("Dozuki",["$window","$http",function($window,$http){var Wrapper=function(){this.send=function(url,options){var httpOptions={url:url,method:options.method,headers:options.headers};httpOptions[options.method=="GET"?"data":"params"]=options.data;return $http(httpOptions).then(function(response){return response.data})}};return function(domain){return new $window.Dozuki(domain,new Wrapper)}}]);angular.module("storage",[]).factory("PersistentList",["$q","$window",function($q,$window){var storage;try{storage=$window.localStorage,x="__storage_test__";storage.setItem(x,x);storage.removeItem(x)}catch(e){storage={}}var List=function(name,toJSON){this.name="PersistentList_"+name;this.itemToJSON=toJSON;this.data=[]};List.prototype.getArray=function(){return this.data.slice()};List.prototype.setData=function(data){var list=this;data.forEach(function(item){item.toJSON=list.itemToJSON});this.data=data;return this};List.prototype.insert=function(item,index){item.toJSON=this.itemToJSON;this.data.splice(index||this.data.length,0,item);return this};List.prototype.remove=function(index){this.data.splice(index,1);return this};List.prototype.save=function(){storage[this.name]=$window.JSON.stringify(this.data);return $q.resolve(this.getArray())};return function(name,toJSON,filter){var list=new List(name,toJSON);try{if(storage[list.name]){list.setData(filter($window.JSON.parse(storage[list.name])))}}catch(e){delete storage[list.name]}return $q.resolve(list)}}]);