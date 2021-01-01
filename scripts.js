// global variables:
const APP_ID = "85e4a70f692bf0d169dde7822353cf50";
let units = {temp:"f",wind:"mph",pres:"in"};
// search location and user location current states:
let searchLocation = {
  loc: "Honolulu",
  coun:"",
  temp:"",
  desc:"",
  feels:"",
  humid:"",
  pres:"",
  wind:""
};
let userLocation ={
  loc:"",
  coun:"",
  temp:"",
  desc: "",
  feels:"",
  humid:"",
  pres:"",
  wind:""
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
    $(".pressure").text(searchLocation.pres+" "+units.pres);
    $(".windspeed").text(searchLocation.wind+" "+units.wind);
  }else{// "urlCoords"
    userLocation = newLocObj;
    $(".location").text(userLocation.loc+", "+userLocation.coun);
    $(".temperature").text(userLocation.temp+"°"+units.temp.toUpperCase());
    $(".description").text(userLocation.desc);
    $(".feelslike").text("Feels like: "+userLocation.feels+"°"+units.temp.toUpperCase());
    $(".humidity").text(userLocation.humid+" %");
    $(".pressure").text(userLocation.pres+" "+units.pres);
    $(".windspeed").text(userLocation.wind+" "+units.wind);
  }
}

// fetch from weather data WeatherStack API based on either location or coordinates:
async function getWeatherData(url) {
    let myUrl = checkUrl(url); // check what type of data we are pulling from API
    /*TODO - Handling of unfulfilled promise from API */
    const response = await fetch(myUrl); // fetch it
    console.log(response);
    const data = await response.json(); // make it json format
    console.log(data);

    if(url == "urlLoc"){
      if (data.count <= 0 ){
        // make popup instead of alert
        alert("City entered is not supported, please enter another city. Ex: 'London' or 'Seoul'. Results are best with city name submitted not country name.");
      }else {
        //succesful location search:
        let newData = {
          loc:data.list[0].name,   // pull necessary data
          coun:data.list[0].sys.country,
          temp:Math.round(data.list[0].main.temp),
          desc:data.list[0].weather[0].main,
          feels:Math.round(data.list[0].main.feels_like),
          humid:data.list[0].main.humidity,
          pres:data.list[0].main.pressure,
          wind:Math.round(data.list[0].wind.speed)
        };
        setWeatherDisplay(url,newData);  // display that data
      }
    }else{ // urlCoords
      if(data.cod === "400"){
        alert("Error. There is something wrong with the browser's geolocation functionality.");
      }else {
        //successful geolocation search:
        let newData = {
          loc:data.name,   // pull necessary data
          coun:data.sys.country,
          temp:Math.round(data.main.temp),
          desc:data.weather[0].main,
          feels:Math.round(data.main.feels_like),
          humid:data.main.humidity,
          pres:data.main.pressure,
          wind:Math.round(data.wind.speed)
        };
        setWeatherDisplay(url,newData);  // display that data
      }
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

// Geolocation functions:
if (!navigator.geolocation)
{
    alert("Geolocation not available on your browser. Please exit alert or enable geolocation in your browser settings.");
}
function success(position)
{
    $(".latitude").val(position.coords.latitude);
    $(".longitude").val(position.coords.longitude);
    getWeatherData("urlCoords"); // set global variables based on user's coordinates
}
function failure()
{
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
      console.log("let is undgwar");
      getUserLocation();
    }else{
      console.log("not the first time");
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
    let newUnits = {temp:"c",wind:"m/s",pres:"mm"}; // change units to Celsius
    units=newUnits;
    if($("#location-toggle").is(":checked")){ // check location toggle
      getWeatherData("urlCoords");
    } else{
      getWeatherData("urlLoc");
    }
  } else { // if not toggled
    let newUnits = {temp:"f",wind:"mph",pres:"in"}; //change units to Farenheit
    units=newUnits;
    if($("#location-toggle").is(":checked")){ // check location toggle
      getWeatherData("urlCoords");
    } else{
      getWeatherData("urlLoc");
    }
  }
});

let currentAnimation = ".cloud";
let weatherDescriptions = {
  cloudy:".cloudy",
  sunny:".day",
  clear:".day",
  mist:".mist",
  fog:".mist",
  hail:".hail",
  "partly cloudy": ".partly-cloudy-day",
  raining: ".medium-rain",
  showers: ".medium-rain",
  lightning:".thunder",
  thunderstorm:".thunder",
  snow:".medium-snow"
};


// animation function
function getAnimation(weatherDesc){

  // GET RID OF THIS:
  $(".description").text(weatherDesc);

  let newAnimation = "";
  // turn off previous animation;
  for (let i = 0; i < currentAnimation.length; i++) {
    console.log(currentAnimation);
    $(currentAnimation).css("display", "none");
  }
  // check through each KEY in myList, if it matches something , append the VALUE into the newAnimation array
  if (weatherDescriptions.hasOwnProperty(weatherDesc)){
    console.log(weatherDesc+" "+weatherDescriptions[weatherDesc]);
    newAnimation = weatherDescriptions[weatherDesc];
    currentAnimation = newAnimation; //set new animation state
    console.log("newAnimation: "+newAnimation);
    $(newAnimation).css("display", "block"); // display weather animation found
  } else{
    // do nothing , new animation is an empty string, input weatherDesc did not match anything in myList
    //TODO ********************************************************************************************8
  }


  /*
  if (newAnimation.length == 0){

    console.log("Weather Description is not in myList");

  }else if (newAnimation.length == 1) { //if array size ==1, just do a normal display ; cloudy, sunny , mist/fog

    if(weatherDesc =="cloudy"){
      console.log("newAnimation[0]: "+newAnimation[0]);
      $(newAnimation[0]).removeClass("cloud-position");
      $(newAnimation[0]).addClass("cloud-animation");
      $(newAnimation[0]).css("display", "block"); // display cloud
    }else if (weatherDesc =="sunny") { // sunny ; elseif
      $(newAnimation[0]).removeClass("sun-position");
      $(newAnimation[0]).addClass("sun-animation");
      $(newAnimation[0]).css("display", "block"); // display cloud
    } else{ // else; mist
      $(newAnimation[0]).css("display", "block"); // display mist
    }

  }else if (newAnimation.length == 2) { // array.length == 2, display it differently ; partly cloudy; rainy; lightning
    if(weatherDesc =="partly cloudy"){
      console.log("newAnimation[0]: "+newAnimation[0]);
      console.log("newAnimation[1]: "+newAnimation[1]);
      $(newAnimation[0]).addClass("cloud-position");
      $(newAnimation[0]).addClass("cloud-animation");
      $(newAnimation[0]).css("display", "block");
      $(newAnimation[1]).addClass("sun-position");
      $(newAnimation[1]).addClass("sun-animation");
      $(newAnimation[1]).css("display", "block");
    }else if (weatherDesc =="raining"||weatherDesc =="showers"){
      console.log("raining");
      $(newAnimation[0]).removeClass("cloud-position");
      $(newAnimation[0]).css("display", "block"); //display cloud
      $(newAnimation[1]).css("display", "block"); // display rain
    }else{ //lightning
      console.log("lightning");
      $(newAnimation[0]).removeClass("cloud-animation");
      $(newAnimation[0]).removeClass("cloud-position");
      $(newAnimation[0]).css("display", "block"); //display cloud
      $(newAnimation[1]).css("display", "block"); //display lightning
    }

  }else{ // array.length === 3 or more; thunderstorm
    if(weatherDesc =="thunderstorm"){
      $(newAnimation[0]).removeClass("cloud-animation");
      $(newAnimation[0]).removeClass("cloud-position");
      $(newAnimation[0]).css("display", "block"); //display cloud
      $(newAnimation[1]).css("display", "block"); //display lightning
      $(newAnimation[2]).css("display", "block"); //display rain
    }
  }*/

}

$( document ).ready(function() {
    getWeatherData("urlLoc");
});
