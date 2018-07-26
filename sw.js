
(function () {
    'use strict'; 
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


    self.addEventListener('fetch', function(event) {
                          
             event.respondWith(
           
               caches.match(event.request)
                 .then(function(response) {

                    if(response){
                     return response;
                    }

                    var fetchRequest = event.request.clone();

                    return fetch(fetchRequest).then(
                         function(response) {
                           if(!response || response.status !== 200 || response.type !== 'basic') {
                               
                               return response;
                            }

           
                           var responseToCache = response.clone();
                           
                           caches.open(staticCacheName)
                                  .then(function(cache) {
                                       cache.put(event.request, responseToCache);
                                  });

                           return response;
                         })
                        .catch(function(err){
                           console.log(" catch : "  , err);
                           return new Response ();

                        })
                                               
                  }) //match
                ); //respondwith
             });  
                          

   
  }) ()  

    





  
