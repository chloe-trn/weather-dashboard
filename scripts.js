// global variables:
const APP_ID = "2e3b7f8f991531cb9a876edb9e0c1a22";
let units = {temp:"f",vis:"mph",precip:"in"};
// search location and user location current states:
let searchLocation = {
  loc: "Chicago",
  reg:"",
  coun:"",
  temp:"",
  desc:"",
  feels:"",
  humid:"",
  precip:"",
  vis:""
};
let userLocation ={
  latitude: "",
  longitude: "",
  loc:"",
  reg:"",
  coun:"",
  temp:"",
  desc: "",
  feels:"",
  humid:"",
  precip:"",
  vis:""
};
/*
function checkUrl(url){
  if(url == "urlLoc"){
    let location = searchLocation.loc;
    if(units.temp == "c"){
      return `http://api.weatherstack.com/current?access_key=${APP_ID}&query=${location}`;
    }else{
      return `http://api.weatherstack.com/current?access_key=${APP_ID}&query=${location}&units=${units.temp}`;
    }
  } else{ // "urlCoords"
    let lat = userLocation.latitude;
    let long = userLocation.longitude;
    if(units.temp == "c"){
      return `http://api.weatherstack.com/current?access_key=${APP_ID}&query=${lat},${long}`;
    }else{
      return `http://api.weatherstack.com/current?access_key=${APP_ID}&query=${lat},${long}&units=${units.temp}`;
    }
  };
}*/

function setWeatherDisplay(inputUrl,newLocObj){
  if(inputUrl == "urlLoc"){
    searchLocation = newLocObj;
    $(".location").text(searchLocation.loc+", "+searchLocation.reg);
    $(".country").text(searchLocation.coun);
    $(".temperature").text(searchLocation.temp+"°"+units.temp.toUpperCase());
    $(".description").text(searchLocation.desc);
    $(".feelslike").text("Feels like: "+searchLocation.feels+"°"+units.temp.toUpperCase());
    $(".humidity").text(searchLocation.humid+" %");
    $(".precipitation").text(searchLocation.precip+" "+units.precip);
    $(".visibility").text(searchLocation.vis+" "+units.vis);
  }else{// "urlCoords"
    userLocation = newLocObj;
    $(".location").text(userLocation.loc+", "+userLocation.reg);
    $(".country").text(userLocation.coun);
    $(".temperature").text(userLocation.temp+"°"+units.temp.toUpperCase());
    $(".description").text(userLocation.desc);
    $(".feelslike").text("Feels like: "+userLocation.feels+"°"+units.temp.toUpperCase());
    $(".humidity").text(userLocation.humid+" %");
    $(".precipitation").text(userLocation.precip+" "+units.precip);
    $(".visibility").text(userLocation.vis+" "+units.vis);
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
    } else {
      // succesful location search:
      let newData = {
        loc:data.location.name,   // pull necessary data
        reg:data.location.region,
        coun:data.location.country,
        temp:data.current.temperature,
        desc:data.current.weather_descriptions[0],
        feels:data.current.feelslike,
        humid:data.current.humidity,
        precip:data.current.precip,
        vis:data.current.visibility
      };
      setWeatherDisplay(url,newData);  // display that data
    }
}
// On submit button click (form submit), location is set to user input and global variables are set to new values:
$("#form").submit(function(){
  searchLocation.loc = document.getElementById("search-text").value; // store input location
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
    $("label.loc-toggle").addClass("translate-x");
    getUserLocation();
  } else { // if not toggled
    getWeatherData("urlLoc"); // switch weather display back to previous search/ current location stored in loc
    $("#search-text").val("");
    $("label.loc-toggle").removeClass("translate-x");
  }
});

// listens for change in units toggle:
$("input[id=units-toggle]").change(function() {
  if ($(this).is(':checked')) { // if toggled
    let newUnits = {temp:"c",vis:"kph",precip:"mm"}; // change units to Celsius
    units=newUnits;
    if($("#location-toggle").is(":checked")){ // check location toggle
      getWeatherData("urlCoords");
    } else{
      getWeatherData("urlLoc");
    }
  } else { // if not toggled
    let newUnits = {temp:"f",vis:"mph",precip:"in"}; //change units to Farenheit
    units=newUnits;
    if($("#location-toggle").is(":checked")){ // check location toggle
      getWeatherData("urlCoords");
    } else{
      getWeatherData("urlLoc");
    }
  }
});
$( document ).ready(function() {
    getWeatherData("urlLoc");
});
