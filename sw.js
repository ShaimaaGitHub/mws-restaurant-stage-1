
(function() {
     'use strict'; 

      var filesToCache = [
          '/',
          'css/styles.css',
          'css/responsive.css',
          'index.html',
          'restaurant.html',
          'js/dbhelper.js',
          'js/main.js',
          'js/restaurant_info.js',
          'data/restaurants.json'
        
      ]; 
      console.log("filesToCache : " + filesToCache);
      var staticCacheName = 'cache-v1';

      self.addEventListener('install', function(event) {
           console.log('Attempting to install service worker and cache static assets');
           event.waitUntil(caches.open(staticCacheName).then(function(cache) {
                     return cache.addAll(filesToCache); }))
    });}) () 


  
