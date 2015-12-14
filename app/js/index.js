(function () {

   angular
      .module('mesos', [])
      .controller('serverController', serverController);

   serverController.$inject = ['$scope'];

   function serverController($scope) {
      'use strict';

      // ###### CONSTANTS ######
      var INITIAL_NUMBER_OF_SERVERS = 4;
      var APPS = ["hadoop", "rails", "chronos", "storm", "spark"];
      // ###### CONSTANTS ######

      // ###### Object models ######
      var App = function (name, serversRunningOn) {
         this.name = name;
         this.serversRunningOn = serversRunningOn;
         this.addServerRunningOn = function (server) {
            this.serversRunningOn.push(server);
         }
      };

      var appInstance = function (app, timeStarted) {
         this.app = app;
         this.timeStarted = timeStarted;
      };

      var server = function (id, appInstances) {
         this.id = id;
         this.appInstances = appInstances;
         this.addAppInstance = function (appInstance) {
            this.appInstances.push(appInstance);
         };
         this.getNumberOfRunningApps = function () {
            return this.appInstances.length;
         };
         this.isServerRunningApp = function () {
            return (this.getNumberOfRunningApps() > 0);
         }
         this.removeAppInstance = function (appInstance) {
            for(var i = 0; i < this.appInstances.length; i++) {
               if(this.appInstances[i].app.name == appInstance.name) {
                  this.appInstances.splice(i, 1);
                  break;
               }
            }
         }
      };
      // ###### Object models ######

      var servers = this;
      var lastUsedId = 0;
      servers.serverList = [];
      servers.appList = [];
      servers.messages = [];

      // TODO
      // destroyServer();
      //

      // ###### Util functions ######
      // ###### Util functions ######

      var getCurrentTime = function () {
         return new Date().toLocaleString()
      };


      var findServerRunningZeroApps = function () {
         for(var server of servers.serverList) {
            if(!server.isServerRunningApp()) {
               return server;
            }
         }
         return null;
      };

      var findServerRunningApps = function (numberOfApps) {
         for(var server of servers.serverList) {
            if(server.getNumberOfRunningApps() === numberOfApps) {
               return server;
            }
         }
         return null;
      };

      var findServerToAddAppInstance = function (argument) {
         var server = findServerRunningZeroApps();
         if(!server) {
            server = findServerRunningApps(1);
         }
         return server;
      };

      servers.addAppInstance = function (app) {
         var server = findServerToAddAppInstance();
         if(!server) {
            console.error("No server free. Add more server instances.");
            servers.messages.push("No server free. Add more server instances.");
         } else{
            var timeStarted = getCurrentTime();
            server.addAppInstance(new appInstance(app, timeStarted));
            // Also add this server to app object.
            app.addServerRunningOn(server);
         }
      };

      servers.killAppInstance = function (app) {
         var lastIndex = app.serversRunningOn.length - 1;
         if(lastIndex < 0) {
            console.error("No running instances.");
            servers.messages.push("No running instances of " + app.name);
         } else {
            var mostRecentServerRunningOn = app.serversRunningOn[lastIndex];
            // Remove app from server.
            mostRecentServerRunningOn.removeAppInstance(app);
            // Remove last server.
            app.serversRunningOn.splice(-1,1);
         }
      };

      servers.addServer = function () {
         servers.serverList.push(new server(lastUsedId + 1, []));
         lastUsedId = lastUsedId + 1;
      };

      servers.destroyServer = function () {
         // Get all apps from server.
         lastUsedId -= 1;
         var lastServer = servers.serverList[lastUsedId];
         // Remove this server from list of servers.
         servers.serverList.splice(-1,1);
         for (var appInstance of lastServer.appInstances) {
            // Try to deploy them on another server.
            servers.addAppInstance(appInstance.app);
         }
      };

      var initServers = function () {
         for(var i = 0; i < INITIAL_NUMBER_OF_SERVERS; i++) {
            servers.addServer();
         }
      };

      var initApps = function () {
         for(var name of APPS) {
            var appCreated = new App(name, []);
            servers.appList.push(appCreated);
         }
      };

      var init = function () {
         initServers();
         initApps();
      };

      init();
   }

})();