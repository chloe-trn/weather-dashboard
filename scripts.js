// global variables:
const APP_ID = '2e3b7f8f991531cb9a876edb9e0c1a22';
let latitude = '';
let longitude = '';
var loc = 'New York'; // default location
var userLoc = ''; 
var temp = '';
var desc = '';

// fetch from weather data WeatherStack API based on either location or coordinates:
async function getWeatherData(url) {

    var myUrl = "";
    if(url == "urlLoc"){
      myUrl = `http://api.weatherstack.com/current?access_key=${APP_ID}&query=${loc}`;
    } else{ // "urlCoords"
      myUrl = `http://api.weatherstack.com/current?access_key=${APP_ID}&query=${latitude},${longitude}`;
    };

    const response = await fetch(myUrl);
    console.log("response:"+response);
    const data = await response.json();
    console.log("data:"+data);
    loc = data.location.name;
    temp = data.current.temperature; 
    desc = data.current.weather_descriptions[0];
    document.getElementById("location").innerHTML = loc;
    document.getElementById("temperature").innerHTML = temp;
    document.getElementById("description").innerHTML = desc;
}

// On submit button click (form submit), location is set to user input and global variables are set to new values: 
function getLocation(){
  loc = document.getElementById("search-text").value;
  getWeatherData("urlLoc");
}
$('#form').submit(function(){
  getLocation();
  return false; // prevents page refresh on form submit
});

// USER LOCATION FUNCTIONS: 

// checks if user has geolocation enabled:
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(setUserCoords);
  } else { 
    // if false; display an alert to user ***************TO DO**********************8:
    console.log("Geolocation is not supported by this browser.");
  }
}

// callback function runs if user geolocation is enabled: 
function setUserCoords(pos) {
  // sets user's coordinates(lattitude, longitude):
  latitude = pos.coords.latitude; 
  longitude = pos.coords.longitude; 
  console.log("lat" + latitude);
  console.log("long" + longitude);
  // set global variables based on user's coordinates: 
  getWeatherData("urlCoords");
}

$('input[name=checkbox]').change(function() {
  if ($(this).is(':checked')) {
    console.log("Checkbox is checked..")
    getUserLocation();
  } else {
    console.log("Checkbox is not checked..")
    // switch weather display back to previous search/ current location stored in loc:

    // ***********TODO***************** 
    getWeatherData("urlLoc");  // last stored loc is user loc so this does not work, use 2 objects to store previous location instead?
  }
});

getWeatherData("urlLoc");

