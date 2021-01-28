// global variables:
const APP_ID = "85e4a70f692bf0d169dde7822353cf50"; // API key
let units = {temp:"f",wind:"mph"};  // default units
let cUnits = {temp:"c",wind:"m/s"};
let fUnits = {temp:"f",wind:"mph"};
let validSearch = 0; // 0 - valid search; 1 - not valid search
let prevValidLocation = "";
// search location and user location current states:
let searchLocation = {
  loc: "Chicago",
  coun:"",
  temp:"",
  desc:"",
  feels:"",
  humid:"",
  pres:"",
  wind:"",
  icon:""
};
let userLocation ={
  loc:"",
  coun:"",
  temp:"",
  desc: "",
  feels:"",
  humid:"",
  pres:"",
  wind:"",
  icon:""
};
let currentAnimation = "";
let weatherDescriptions = { // icon-name : corresponding animation class
  "01d":".day",
  "01n":".night",
  "02d":".cloudy-day",
  "02n":".cloudy-night",
  "03d":".cloudy",
  "03n":".cloudy",
  "04d":".cloudy",
  "04n":".cloudy",
  "09d":".rainy",
  "09n":".rainy",
  "10d":".rainy-day",
  "10n":".rainy",
  "11d":".thunder",
  "11n":".thunder",
  "13d":".snow",
  "13n":".snow",
  "50d":".mist",
  "50n":".mist"
};
// return the API call depending on if user's location toggle is on and what units are chosen
function checkUrl(url){
  if(url == "urlLoc"){
    let location = searchLocation.loc;
    if(units.temp == "c"){
      return `https://api.openweathermap.org/data/2.5/find?q=${location}&appid=${APP_ID}&units=metric`;
    }else{ //F
      return `https://api.openweathermap.org/data/2.5/find?q=${location}&appid=${APP_ID}&units=imperial`;
    }
  } else{ // "urlCoords"
    let lat = $(".latitude").val();
    let long = $(".longitude").val();
    if(units.temp == "c"){
      return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${APP_ID}&units=metric`;
    }else{ //F
      return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${APP_ID}&units=imperial`;
    }
  };
}
// Set the DOM with values found from the API call
function setWeatherDisplay(inputUrl,newLocObj){
  if(inputUrl == "urlLoc"){
    searchLocation = newLocObj;
    $(".location").text(searchLocation.loc+", "+searchLocation.coun);
    $(".temperature").text(searchLocation.temp+"°"+units.temp.toUpperCase());
    $(".description").text(searchLocation.desc);
    $(".feelslike").text("Feels like: "+searchLocation.feels+"°"+units.temp.toUpperCase());
    $(".humidity").text(searchLocation.humid+" %");
    $(".pressure").text(searchLocation.pres+" inHg");
    $(".windspeed").text(searchLocation.wind+" "+units.wind);
    $(".w-icon").attr("src", "https://openweathermap.org/img/w/" + searchLocation.icon + ".png");
  }else{// "urlCoords"
    userLocation = newLocObj;
    $(".location").text(userLocation.loc+", "+userLocation.coun);
    $(".temperature").text(userLocation.temp+"°"+units.temp.toUpperCase());
    $(".description").text(userLocation.desc);
    $(".feelslike").text("Feels like: "+userLocation.feels+"°"+units.temp.toUpperCase());
    $(".humidity").text(userLocation.humid+" %");
    $(".pressure").text(userLocation.pres+" inHg");
    $(".windspeed").text(userLocation.wind+" "+units.wind);
    $(".w-icon").attr("src", "https://openweathermap.org/img/w/" + userLocation.icon + ".png");
  }
}
// Fetch from weather data OpenWeather API based on either location or coordinates
async function getWeatherData(url) {
    let myUrl = checkUrl(url);            // check what type of data we are pulling from API
    const response = await fetch(myUrl);  // fetch it
    const data = await response.json();   // make it json
    // pulling data process is different depending on the query type urlLoc or urlCoords:
    if(url == "urlLoc"){  // user enters location:
      if (data.count <= 0 ){             // user entered invalid city
        alert("City entered is not supported, please enter another city. Ex: 'London' or 'Seoul'. Results are best with city name submitted not country name.");
        validSearch = 1;                // not a valid search
        searchLocation.loc = prevValidLocation;    // set stored object to the previous valid search
      }else{
        validSearch = 0; // valid search
        let newData = {  // pull necessary data in object
          loc:data.list[0].name,
          coun:data.list[0].sys.country,
          temp:Math.round(data.list[0].main.temp),
          desc:data.list[0].weather[0].main,
          feels:Math.round(data.list[0].main.feels_like),
          humid:data.list[0].main.humidity,
          pres:data.list[0].main.pressure,
          wind:Math.round(data.list[0].wind.speed),
          icon: data.list[0].weather[0].icon
        };
        setWeatherDisplay(url,newData);// pass object to display data on DOM
        getAnimation(data.list[0].weather[0].icon); // set animation on DOM based on data
      }
      if($("#location-toggle").is(":checked") && validSearch == 0){ // if location is toggled and the search IS valid
        $("#location-toggle").prop( "checked", false );  // un-toggle location toggle
      }
      prevValidLocation = data.list[0].name;  // set valid search as previous location for use if next searches are not valid
    }else{ // urlCoords, user toggles location:
      if(data.cod === "400"){
        alert("Error. There is something wrong with the browser's geolocation functionality.");
      }else {
        let newData = {
          loc:data.name,   // pull necessary data
          coun:data.sys.country,
          temp:Math.round(data.main.temp),
          desc:data.weather[0].main,
          feels:Math.round(data.main.feels_like),
          humid:data.main.humidity,
          pres:data.main.pressure,
          wind:Math.round(data.wind.speed),
          icon:data.weather[0].icon
        };
        setWeatherDisplay(url,newData);     // pass object to display data on DOM
        getAnimation(data.weather[0].icon); // set animation on DOM based on data
      }
    }
}
// On form submit, city input is set as location variable and API data is fetched
$("#form").submit(function(){
  searchLocation.loc = document.getElementById("search-text").value; // set input city
  getWeatherData("urlLoc");  // get and display input city to DOM
  $("#search-text").val(""); // clear search
  return false; // prevent page refresh on form submit
});

// Geolocation functions to fetch user coordinates
if (!navigator.geolocation){
    alert("Geolocation not available on your browser. Please exit alert or enable geolocation in your browser settings.");
    // un-toggle location toggle
    if($("#location-toggle").is(":checked")){ 
      $("#location-toggle").prop( "checked", false );  
    }
}
function success(pos){
    $(".latitude").val(pos.coords.latitude);
    $(".longitude").val(pos.coords.longitude);
    getWeatherData("urlCoords");
}
function failure(){
  alert("Geolocation not available on your browser. Please exit alert or enable geolocation in your browser settings.");
}
async function getUserLocation(){
  navigator.geolocation.getCurrentPosition(success,failure);
}
// Listen for change in toggle for location
$("input[id=location-toggle]").change(function() {
  if ($(this).is(':checked')) { // if toggled
    $("#search-text").val("");                  // clear search field
    if ($(".latitude").val() == ""){            // if this is the first time location is toggled
      getUserLocation();                        // use Geolocation to get user coordinates
    }else{  // not the first time location is toggled
      getWeatherData("urlCoords");              // fetch data based on coordinates and display on DOM
    }
  } else { // if not toggled
    getWeatherData("urlLoc");                   // switch weather display back to previous search
    $("#search-text").val("");                  // clear search field
  }
});
// listen for change in toggle for units
$("input[id=units-toggle]").change(function() {
  if ($(this).is(':checked')) { // if toggled
    units=cUnits;                              // update to cUnits
    if($("#location-toggle").is(":checked")){  // check location toggle -> update DOM
      getWeatherData("urlCoords");
    } else{
      getWeatherData("urlLoc");
    }
  } else { // if not toggled
    units=fUnits;                             // update to fUnits
    if($("#location-toggle").is(":checked")){ // check location toggle -> update DOM
      getWeatherData("urlCoords");
    } else{
      getWeatherData("urlLoc");
    }
  }
});
// Search for and display animation
function getAnimation(weatherDesc){
  let newAnimation = "";
  for (let i = 0; i < currentAnimation.length; i++) {
    $(currentAnimation).css("display", "none"); // turn off previous animations
  }
  // check through each key in list, if it matches something, set newAnimation
  if (weatherDescriptions.hasOwnProperty(weatherDesc)){
    newAnimation = weatherDescriptions[weatherDesc];
    currentAnimation = newAnimation;         // set new animation state
    $(newAnimation).css("display", "block"); // display new animation
  } else{ // if animation is not found
    currentAnimation = ".else-case";
    $(".else-case").css("display", "block");
  }
}
$( document ).ready(function() { // on document load
    getWeatherData("urlLoc");    // fetch and display data to DOM for default location of Chicago
});
