
(function () {
    'use strict'; 
    console.log("service worker");

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
                        return cache.addAll(filesToCache); }
                 ))
        });


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

             ); //waituntil
         }); 




           self. addEventListener("fetch", function(event) {
                let reqURL = new URL(event.request.url);
  
               if (reqURL.pathname === "/" || reqURL.pathname === "/index.html") {
                     event.respondWith(
                     caches.open(staticCacheName).then(function(cache) {
                         return cache.match("/index.html").then(function(cachedResponse) {
                                let fetchPromise = fetch("/index.html")
                               .then(function(networkResponse) {
                                   let nwResponse = networkResponse.clone();
                                   cache.put("/index.html", nwResponse);
                                   return networkResponse;
                               });
                          return cachedResponse || fetchPromise;
                        });
                     })
                    ); //respondWith
                 } //if
               else if (reqURL.pathname === "/restaurant.html") {
                    event.respondWith(
                    caches.open(staticCacheName).then(function(cache) {
                        return cache.match("/restaurant.html").then(function(cachedResponse) {
                               let fetchPromise = fetch("/restaurant.html")
                               .then(function(networkResponse) {
                                   let nwResponse = networkResponse.clone();
                                   cache.put("/restaurant.html", nwResponse);
                                   return networkResponse;
                               });
                          return cachedResponse || fetchPromise;
                        });
                     })
                    ); //respondWith
                  } // else if
               else if (filesToCache.includes(reqURL.href) || filesToCache.includes(reqURL.pathname))
                    {
                       event.respondWith(
                       caches.open(staticCacheName).then(function(cache) {
                         return cache.match(event.request).then(function(response) {
                           return response || fetch(event.request);
                          });
                         })
                       ); //respond With
                    } //elseif
          }); 

 
  }) ()  

    





  
