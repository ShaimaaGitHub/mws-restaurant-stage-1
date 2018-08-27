let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    console.log("rest-info.js");
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      console.log("rest-info rest ", restaurant);
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  const str1="Image of ";
  const str2=" restaurant";
  image.alt= str1.concat(restaurant.name, str2);
  /*image.alt= 'A photo of the restaurant'; */
  const a=DBHelper.Opt1ImageUrlForRestaurant(restaurant);
  const b=DBHelper.Opt2ImageUrlForRestaurant(restaurant);
  const c= a +  "," + b;
   /*image.sizes='sizes="(max-width: 400px) 100vw, (min-width: 401px) 50vw"';*/
  image.srcset= c; 

  

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill form
  fillFormHTML(restaurant);

  // fill reviews

  fillReviewsHTML(restaurant.id);

}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
  
  fillReviewsHTML =(restaurantId)  => {

        
    const port=1337;
    

    fetch( `http://localhost:${port}/reviews/?restaurant_id=${restaurantId}`)
                   .then(function(response) {
                      console.log("json review response", response);
                      return response.json();
                   })  
                   .then(reviews=> {
                     
                                        
                        
                       console.log("fill reviews ", reviews);
                       const container = document.getElementById('reviews-container');
                       const title = document.createElement('h4');
                       title.innerHTML = 'Reviews';
                       container.appendChild(title);

                       if (!reviews) {
                          const noReviews = document.createElement('p');
                          noReviews.innerHTML = 'No reviews yet!';
                          container.appendChild(noReviews);
                       return;
                       }
                       const ul = document.getElementById('reviews-list');
                                   reviews.forEach(review => {
                                      ul.appendChild(createReviewHTML(review));
                                    });
                       container.appendChild(ul);
                       console.log("fill reviews 2 ");
                       fillRiewsDb(restaurantId);
                          })    
                   .catch(error=>{
                         console.log("catchdeyim");
                         fillFromDb(restaurantId);

                   })
    
   }


   fillFromDb=(restaurandId) =>{
        console.log("içerdeyim");
        const dbPromise = idb.open("restdb", 1);
        dbPromise
          .then(function(db){
                  var tx=db.transaction("reviews", "readonly");
                  var store=tx.objectStore("reviews");
                  console.log("fillfromdb");
                  return store.getAll();  
              })
           .then(reviews=> {
                console.log("reviews from db: ", reviews);

                   const container = document.getElementById('reviews-container');
                    const title = document.createElement('h4');
                    title.innerHTML = 'Reviews';
                    container.appendChild(title);

                       if (!reviews) {
                          const noReviews = document.createElement('p');
                          noReviews.innerHTML = 'No reviews yet!';
                          container.appendChild(noReviews);
                       return;
                       }
                       const ul = document.getElementById('reviews-list');
                                   reviews.forEach(review => {
                                    console.log("appending");
                                      ul.appendChild(createReviewHTML(review));
                                    });
                       container.appendChild(ul); 
           }) 

   }





   fillRiewsDb=(restaurantId)=>{
       console.log("hani ?");
    
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
                console.log("review dbde if çıkışı");
              });  





       const port=1337;

       fetch( `http://localhost:${port}/reviews/?restaurant_id=${restaurantId}`)
                   .then(function(response) {
                      console.log("json review response", response);
                      return response.json();
                   })  
                   .then(reviews=> {

                      dbPromise
                          .then(function(db){
                            console.log("review idb işlemlerine giriş");
                            const tx= db.transaction("reviews","readwrite");
                            const store= tx.objectStore("reviews");
                            for(var i=0; i<reviews.length; i++)
                                   {store.put(reviews[i]);
                                         console.log("review store :" + reviews[i] + i);
                                   }
                            })});   
                               
   }

/**
 * Create review HTML and add it to the webpage.
 */
  createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  d=review.createdAt;
  dd= new Date(d);
  date.innerHTML = dd;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}


 fillFormHTML = (restaurant) => {
  const container = document.getElementById('form-container');
  const form=document.createElement("form");
  form.id="form";
  
  console.log("formdayım");
  container.appendChild(form);

  
  const fieldSet = document.createElement('fieldset');
  form.appendChild(fieldSet);

 /* const div1=document.createElement("div");
  fieldSet.appendChild(div1); */

  const legend= document.createElement("legend");
  legend.innerHTML="New Review";
  fieldSet.appendChild(legend);

  const br1= document.createElement("br");
  fieldSet.appendChild(br1);

 /* const div2=document.createElement("div");
  legend.appendChild(div2);*/

  const label= document.createElement("label");
  label.for="user";
  label.innerHTML="Your Name"
  fieldSet.appendChild(label);

  const input= document.createElement("input");
  input.type="text";
  input.name="user";
  input.id="user";
  fieldSet.appendChild(input);
 /* fieldSet.appendChild(br);*/
  const br2= document.createElement("br");
  fieldSet.appendChild(br2);


  const labelr= document.createElement("label");
  labelr.for="rating";
  labelr.innerHTML="Your Rating"
  fieldSet.appendChild(labelr);

  const inputR= document.createElement("input");
  inputR.type="number";
  inputR.name="rating";
  inputR.id="rating";
  fieldSet.appendChild(inputR);
  

  const br3= document.createElement("br");
  fieldSet.appendChild(br3);

  const textArea=document.createElement("textarea");
  textArea.rows="8";
  textArea.cols="50";
  textArea.name="comment";
  fieldSet.appendChild(textArea);
 /* fieldSet.appendChild(br);*/
  const br4= document.createElement("br");
  fieldSet.appendChild(br4);

 /* const div4=document.createElement("div");
  div3.appendChild(div4); */

  const submit=document.createElement("input");
  submit.type="submit";
  submit.name="submit";
  submit.value="submit";
  
  submit.setAttribute("onclick","addReview()");

  console.log("clicklendim!..........");

  fieldSet.appendChild(submit);

  const br5= document.createElement("br");
  fieldSet.appendChild(br5);


 // fillReviewsHTML(restaurant.id);


   
  }

  

addReview = (restaurant=self.restaurant)=>{
 
    
   event.preventDefault();
   
   const theForm=document.getElementById("form");
   console.log("comment : " , theForm.comment.value);
   const input=document.getElementById("user");
   const comment=document.getElementById("comment");
   const inputR=document.getElementById("rating");

   console.log("brrr :" + input.value, theForm.comment.value,inputR.value );
   const testr= document.getElementById('reviews-list');

    const li = document.createElement('li');
    const name = document.createElement('p');
    name.innerHTML = input.value;
    li.appendChild(name);

    const date = document.createElement('p');
    date.innerHTML = new Date();
    li.appendChild(date); 

    const rating = document.createElement('p');
    rating.innerHTML = inputR.value;
    li.appendChild(rating); 

    const comments = document.createElement('p');
    comments.innerHTML = theForm.comment.value;
    li.appendChild(comments);
    testr.insertBefore(li, testr.childNodes[0]);             
    

   let reviewObj=  {
    "restaurant_id": restaurant.id,
    "name": input.value,
    "rating": parseInt(inputR.value),
    "comments": theForm.comment.value
   };

   theForm.reset();
   var fetchOptions= {
        method:"POST",
        body: JSON.stringify(reviewObj),
        headers: new Headers({ "Content-type" : "application/json"})
   };
   
   if(!window.navigator.onLine){
        console.log("nav not online");
        toLocalStorage(reviewObj,fetchOptions);
      } else {
             console.log("nav  online");
            fetch( `http://localhost:1337/reviews`, fetchOptions)
                   .then(res=> res.json())
                   .then(response=> console.log("json review success", response))
                   .catch(error=>console.error('Error:', error));
             }

  }


toLocalStorage =(reviewObj,fetchOptions)=>{
     localStorage.setItem("rwdata",JSON.stringify(reviewObj));
     window.addEventListener("online",(event)=>{
         let rew = JSON.parse(localStorage.getItem("rwdata"));
         fetch( `http://localhost:1337/reviews`, fetchOptions)
                   .then(rew=> rew.json())
                   .then(response=> console.log("json review success", response))
                   .catch(error=>console.error('Error:', error));

     })
}



/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
