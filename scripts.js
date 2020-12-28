// global variables:
const APP_ID = "2e3b7f8f991531cb9a876edb9e0c1a22";
// search location and user location current states:
let searchLocation = {
  loc: "New York",
  temp:"",
  desc:""
};
let userLocation ={
  latitude: "",
  longitude: "",
  loc:"",
  temp:"",
  desc: ""
};
let units ="f"; // farenheit units is default

function checkUrl(url){
  if(url == "urlLoc"){
    let location = searchLocation.loc;
    if(units == "c"){
      return `http://api.weatherstack.com/current?access_key=${APP_ID}&query=${location}`;
    }else{
      return `http://api.weatherstack.com/current?access_key=${APP_ID}&query=${location}&units=${units}`;
    }
  } else{ // "urlCoords"
    let lat = userLocation.latitude;
    let long = userLocation.longitude;
    if(units == "c"){
      return `http://api.weatherstack.com/current?access_key=${APP_ID}&query=${lat},${long}`;
    }else{
      return `http://api.weatherstack.com/current?access_key=${APP_ID}&query=${lat},${long}&units=${units}`;
    }
  };
}

function setWeatherDisplay(inputUrl,location,temperature,description){
  if(inputUrl == "urlLoc"){
    searchLocation.loc = location;
    searchLocation.temp = temperature;
    searchLocation.desc = description;
    $(".location").text(searchLocation.loc);
    $(".temperature").text(searchLocation.temp+"°"+units.toUpperCase());
    $(".description").text(searchLocation.desc);
  }else{// "urlCoords"
    userLocation.loc = location;
    userLocation.temp = temperature;
    userLocation.desc = description;
    $(".location").text(userLocation.loc);
    $(".temperature").text(userLocation.temp+"°"+units.toUpperCase());
    $(".description").text(userLocation.desc);
  }
}

// fetch from weather data WeatherStack API based on either location or coordinates:
async function getWeatherData(url) {
    let myUrl = checkUrl(url); // check what type of data we are pulling from API
    /*TODO - Handling of unfulfilled promise from API */
    const response = await fetch(myUrl); // fetch it
    const data = await response.json(); // make it json format
    if (data.hasOwnProperty("success") && data["success"] == false){
      // make popup instead of alert
      alert("Location entered is not supported, please enter another location. Ex: 'London' or 'London, United Kingdom'. Accepts name, country, or region.");
    } else{
      // succesful location search:
      let loc = data.location.name;   // pull necessary data
      let temp = data.current.temperature;
      let desc = data.current.weather_descriptions[0];
      setWeatherDisplay(url,loc,temp,desc);  // display that data
    }
}
// On submit button click (form submit), location is set to user input and global variables are set to new values:
$("#form").submit(function(){
  searchLocation.loc = document.getElementById("search-text").value;
  getWeatherData("urlLoc"); // get and display input location
  $("#search-text").val(""); // clear search
  if($("#location-toggle").is(":checked")){
    $("#location-toggle").prop( "checked", false );  // un-toggle
  }
  return false; // prevents page refresh on form submit
});
// checks if user has geolocation enabled:
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(setUserCoords);
  } else {
    alert("Geolocation is not enabled or supported in your browser. Please enable geolocation in browser settings or exit this alert.");
    $("#location-toggle").prop( "checked", false );  // un-toggle
  }
}
// callback function runs if user geolocation is enabled:
function setUserCoords(pos) {
  // sets user's coordinates(lattitude, longitude):
  userLocation.latitude = pos.coords.latitude;
  userLocation.longitude = pos.coords.longitude;
  getWeatherData("urlCoords"); // set global variables based on user's coordinates
}

// listens for change in toggle checkbox for userlocation:
$("input[id=location-toggle]").change(function() {
  if ($(this).is(':checked')) { // if toggled
    $("#search-text").val("");
    getUserLocation();
  } else { // if not toggled
    getWeatherData("urlLoc"); // switch weather display back to previous search/ current location stored in loc
    $("#search-text").val("");
  }
});


// listens for change in units toggle:
$("input[id=units-toggle]").change(function() {
  if ($(this).is(':checked')) { // if toggled
    units ="c";
    if($("#location-toggle").is(":checked")){ // check location toggle
      getWeatherData("urlCoords");
    } else{
      getWeatherData("urlLoc");
    }
  } else { // if not toggled
    units ="f";
    if($("#location-toggle").is(":checked")){ // check location toggle
      getWeatherData("urlCoords");
    } else{
      getWeatherData("urlLoc");
    }
  }
});

getWeatherData("urlLoc");
