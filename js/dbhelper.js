/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
 /** static get DATABASE_URL() {
    const port = 8000 // Change this to your server port
    return `http://localhost:${port}/Seyma/mws-restaurant-stage-1/data/restaurants.json`;

  }*/

 static get DATABASE_URL() {
    const port = 1337;
    return `http://localhost:${port}/restaurants`;}


  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
       let fetchUrl= DBHelper.DATABASE_URL;
        
       const dbPromise = idb.open("restdb", 1 , function(db){
                if (!db.objectStoreNames.contains("restaurants")) {
                   db.createObjectStore("restaurants",{keyPath : "id"}); 
                   console.log(" db created!");                   
                }
                if (!db.objectStoreNames.contains('reviewsDb')) {
                   console.log("yok işte");
                   const reviewStore= db.createObjectStore("reviews",{keyPath : "id"});
                   reviewStore.createIndex("restaurant","restaurant_id");
                }
                console.log("if çıkışı");
              });


       
        dbPromise
            .then(db=> { 
                  console.log("dbyi gönder") ; 
                  var tx=db.transaction("restaurants", "readonly");
                  var store=tx.objectStore("restaurants");
                  return store.getAll();  
                     
            })
            .then(restaurants=> {
                console.log("restaurant giriş :", restaurants);
                if (!restaurants || restaurants.length===0){
                  console.log("restoran yok");
                  fetch(fetchUrl)
                   .then(function(response) {
                      console.log("json response");
                      return response.json();
                   })  
                   .then(restaurants=> {
                        console.log(" network fetch ");
                        dbPromise
                          .then(function(db){
                            console.log("db işlemlerine giriş");
                            const tx= db.transaction("restaurants","readwrite");
                            const store= tx.objectStore("restaurants");
                            for(var i=0; i<restaurants.length; i++)
                                   {store.put(restaurants[i]);
                                         console.log("store :" + restaurants[i] + i);
                                   }
                            console.log("complete . " );
                            console.log("tamamdır " );
                           
                          })          
                        callback(null,restaurants);
                        console.log("restoran fetch ile bulundu " + restaurants);
                    })
                    
                 } else { 
                   callback(null,restaurants);
                   console.log("restoran bulundu") ;}
              
              })
            
  } 

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    
    DBHelper.fetchRestaurants((error, restaurants) => {
       
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

/*static fetchReviews(restaurantId, callback) {
    // 
    const port=1337;
    

    fetch( `http://localhost:${port}/reviews/?restaurant_id=${restaurantId}`)
                   .then(function(response) {
                      console.log("json review response", response);
                      return response.json();
                   })  
                   .then(data=> {
                        let reviews=data;
                        console.log(" all reviews fetched ", reviews);
                        callback(null,reviews);})
                       // return reviews}); 
      
    
   }*/
      








  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
       
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        console.log("mahalle : " + uniqueNeighborhoods);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
     return (`./restaurant.html?id=${restaurant.id}`);

  }

 // Update favoriteness */

  static changeFavStat (restaurantId,isFavorite){
      const dbPromise = idb.open("restdb",1, function(db){
                if (!db.objectStoreNames.contains("restaurants")) {
                   db.createObjectStore("restaurants",{keyPath : "id"}); 
                   console.log(" db created! fav");                   
                }
                console.log("if çıkışı fav");
              });
      console.log("cfs 1 " + restaurantId , isFavorite);
      fetch(`http://localhost:1337/restaurants/${restaurantId}/?is_favorite=${isFavorite}`,{method : 'PUT'}) 
        .then(()=> {console.log("cfs 2 " + restaurantId , isFavorite);
         dbPromise
            .then(db=> { 
                  console.log("dbye bakalım ", isFavorite) ; 
                  const tx=db.transaction("restaurants", "readwrite");
                  const store=tx.objectStore("restaurants");
                   store.get(restaurantId)
                    .then(restaurant=>{
                        console.log("idb değişmeden " , restaurant.is_favorite);
                        restaurant.is_favorite=isFavorite;
                        store.put(restaurant);
                        console.log("fav idb");

                    }) // get then 
                     
            }) // dbpromise then 
            
        })  //fetch then
      
    }

  /**
   * Restaurant image URL.
   */
 
 static imageUrlForRestaurant(restaurant) {
 //     return (`/img/${restaurant.photograph}`);
      var myProp="photograph";
      
      if (!(myProp in restaurant)) {
         return (`/img/NoImg.jpg`);
      }
      
      return (`/img/${restaurant.photograph}-400.jpg`);      
  }


 static Opt1ImageUrlForRestaurant(restaurant) {
  //  return (`/img/${restaurant.photograph_opt1}-400.jpg 400w`);
        var myProp="photograph";
       if (!(myProp in restaurant)) {
        
         return (`/img/NoImg.jpg 400w` );
       }
    return (`/img/${restaurant.photograph}-400.jpg 400w`);
  }
  static Opt2ImageUrlForRestaurant(restaurant) {
  //  return (`/img/${restaurant.photograph_opt2}-800.jpg 800w`);
       var myProp="photograph";
      if (!(myProp in restaurant)) {
       
         return (`/img/NoImg.jpg 800w`);
      }
    return (`/img/${restaurant.photograph}-800.jpg 800w`);
  } 
  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
