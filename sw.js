
(function() {
     'use strict'; 

 //    importScripts("./idb.js");

      console.log("service workerdayım");

      var filesToCache = [
          '/',
          'css/styles.css',
          'css/responsive.css',
          'manifest.json',
          'index.html',
          'restaurant.html',
          "./idb.js",
          'js/dbhelper.js',
          'js/main.js',
          'js/restaurant_info.js'
      //    'data/restaurants.json'
        
      ]; 

   

     console.log("filesToCache : " + filesToCache);
      var staticCacheName = 'cache-v1';

      self.addEventListener('install', function(event) {
           console.log('Attempting to install service worker and cache static assets'); 
           event.waitUntil(caches.open(staticCacheName).then(function(cache) {
                     return cache.addAll(filesToCache); }))
    });

      self.addEventListener('fetch', function(event) {
           event.respondWith(
              caches.match(event.request).then(function(responseCache) {
                return responseCache || fetch(event.request).then(function(responseNetwork) {
                    let responseClone = responseNetwork.clone();
                    caches.open(staticCacheName).then(function(cache) {
                         cache.put(event.request, responseClone);
                        // console.log("cloning :" , responseClone);
                    });
                    return responseNetwork;
                  });
              }).catch(function(error) {
                    console.log("No matched cache found : " ,  error);
                 })
           );
     }) 

   
    self.addEventListener("activate", function(event) {
         console.log("Serviceworker Activation");
         event.waitUntil(
           caches.keys().then(function(keyList) {
               return Promise.all(keyList.map(function(key) {
                    if  (key !== staticCacheName) {
                      console.log("ServiceWorker : Removing old cache shell", key);
                      return caches.delete(key);
                    }
               }));
          })

        );
    }); 

    }) ()  

    





  
