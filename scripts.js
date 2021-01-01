// global variables:
const APP_ID = "85e4a70f692bf0d169dde7822353cf50";
let units = {temp:"f",wind:"mph"};
// search location and user location current states:
let validSearch = 0; // 0 - valid search, 1 - not valid search
let prevValidLocation = "";
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

function checkUrl(url){
  if(url == "urlLoc"){
    let location = searchLocation.loc;
    if(units.temp == "c"){
      return `http://api.openweathermap.org/data/2.5/find?q=${location}&appid=${APP_ID}&units=metric`;
    }else{ //F
      return `http://api.openweathermap.org/data/2.5/find?q=${location}&appid=${APP_ID}&units=imperial`;
    }
  } else{ // "urlCoords"
    let lat = $(".latitude").val();
    let long = $(".longitude").val();
    if(units.temp == "c"){
      return `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${APP_ID}&units=metric`;
    }else{ //F
      return `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${APP_ID}&units=imperial`;
    }
  };
}

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
    $(".w-icon").attr("src", "http://openweathermap.org/img/w/" + searchLocation.icon + ".png");
  }else{// "urlCoords"
    userLocation = newLocObj;
    $(".location").text(userLocation.loc+", "+userLocation.coun);
    $(".temperature").text(userLocation.temp+"°"+units.temp.toUpperCase());
    $(".description").text(userLocation.desc);
    $(".feelslike").text("Feels like: "+userLocation.feels+"°"+units.temp.toUpperCase());
    $(".humidity").text(userLocation.humid+" %");
    $(".pressure").text(userLocation.pres+" inHg");
    $(".windspeed").text(userLocation.wind+" "+units.wind);
    $(".w-icon").attr("src", "http://openweathermap.org/img/w/" + userLocation.icon + ".png");
  }
}

// fetch from weather data WeatherStack API based on either location or coordinates:
async function getWeatherData(url) {
    let myUrl = checkUrl(url); // check what type of data we are pulling from API
    const response = await fetch(myUrl); // fetch it
    const data = await response.json(); // make it json format
    console.log(data);

    // pulling data is different depending on the query type urlLoc or urlCoords:
    if(url == "urlLoc"){
      if (data.count <= 0 ){
        alert("City entered is not supported, please enter another city. Ex: 'London' or 'Seoul'. Results are best with city name submitted not country name.");
        validSearch = 1;
        searchLocation.loc = prevValidLocation;
      }else{//succesful location search:
        validSearch = 0;
        let newData = {
          loc:data.list[0].name,   // pull necessary data
          coun:data.list[0].sys.country,
          temp:Math.round(data.list[0].main.temp),
          desc:data.list[0].weather[0].main,
          feels:Math.round(data.list[0].main.feels_like),
          humid:data.list[0].main.humidity,
          pres:data.list[0].main.pressure,
          wind:Math.round(data.list[0].wind.speed),
          icon: data.list[0].weather[0].icon
        };
        setWeatherDisplay(url,newData);  // display that data
        getAnimation(data.list[0].weather[0].icon);
      }
      if($("#location-toggle").is(":checked") && validSearch == 0){ // if location is toggled and the search IS valid
        $("#location-toggle").prop( "checked", false );  // un-toggle
        $("label.loc-toggle").removeClass("translate-x");
      }
      prevValidLocation = data.list[0].name;  // set valid search as previous location for use if next searches are not valid
    }else{ // urlCoords
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
        setWeatherDisplay(url,newData);  // display that data
        getAnimation(data.weather[0].icon);
      }
    }
}
// On submit button click (form submit), location is set to user input and global variables are set to new values:
$("#form").submit(function(){
  searchLocation.loc = document.getElementById("search-text").value; // store input location
  getWeatherData("urlLoc"); // get and display input location
  $("#search-text").val(""); // clear search
  return false; // prevents page refresh on form submit
});

// Geolocation functions:
if (!navigator.geolocation){
    alert("Geolocation not available on your browser. Please exit alert or enable geolocation in your browser settings.");
}
function success(pos){
    $(".latitude").val(pos.coords.latitude);
    $(".longitude").val(pos.coords.longitude);
    getWeatherData("urlCoords"); // set global variables based on user's coordinates
}
function failure(){
  alert("Geolocation not available on your browser. Please exit alert or enable geolocation in your browser settings.");
}
async function getUserLocation(){
  navigator.geolocation.getCurrentPosition(success,failure);
}

// listens for change in toggle checkbox for userlocation:
$("input[id=location-toggle]").change(function() {
  if ($(this).is(':checked')) { // if toggled
    $("#search-text").val("");
    $("label.loc-toggle").addClass("translate-x");
    if ($(".latitude").val() == ""){
      getUserLocation();
    }else{
      getWeatherData("urlCoords");
    }
  } else { // if not toggled
    getWeatherData("urlLoc"); // switch weather display back to previous search/ current location stored in loc
    $("#search-text").val("");
    $("label.loc-toggle").removeClass("translate-x");
  }
});

// listens for change in units toggle:
$("input[id=units-toggle]").change(function() {
  if ($(this).is(':checked')) { // if toggled
    let newUnits = {temp:"c",wind:"m/s"}; // change units to Celsius
    units=newUnits;
    if($("#location-toggle").is(":checked")){ // check location toggle
      getWeatherData("urlCoords");
    } else{
      getWeatherData("urlLoc");
    }
  } else { // if not toggled
    let newUnits = {temp:"f",wind:"mph"}; //change units to Farenheit
    units=newUnits;
    if($("#location-toggle").is(":checked")){ // check location toggle
      getWeatherData("urlCoords");
    } else{
      getWeatherData("urlLoc");
    }
  }
});

// Searches for and displays an animation:
function getAnimation(weatherDesc){
  let newAnimation = "";
  // turn off previous animation;
  for (let i = 0; i < currentAnimation.length; i++) {
    $(currentAnimation).css("display", "none");
  }
  // check through each KEY in myList, if it matches something, set newAnimation
  if (weatherDescriptions.hasOwnProperty(weatherDesc)){
    newAnimation = weatherDescriptions[weatherDesc];
    currentAnimation = newAnimation; //set new animation state
    $(newAnimation).css("display", "block"); // display weather animation found
  } else{
    // if icon is not found
    currentAnimation = ".else-case";
    $(".else-case").css("display", "block");
  }
}

$( document ).ready(function() {
    getWeatherData("urlLoc");
});
