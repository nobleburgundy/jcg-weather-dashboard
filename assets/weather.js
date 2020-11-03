let apiKey = "b9e555b2714e9fd91e3ffa2b450b8030";
const LOCAL_STORAGE_KEY = "recent-weather-searches";
let searchHistoryArray = [];

$(document).ready(function () {
  localSearchHistroyFromLocalStorage();
  renderSavedSearchButtons();
});

$("#search-form").on("submit", function (event) {
  event.preventDefault();

  let searchText = $("#search-input").val();
  $("#jumbo-city").text(searchText);
  getWeatherDataForCity(searchText);

  // Store search in an array
  searchHistoryArray.unshift(searchText);
  $("#saved-search-list").prepend(searchHistoryBtn(searchText));
  saveRecentSearchesToLocalStorage();
});

function saveRecentSearchesToLocalStorage() {
  let searches = JSON.stringify(searchHistoryArray);
  localStorage.setItem(LOCAL_STORAGE_KEY, searches);
}

function localSearchHistroyFromLocalStorage() {
  let local = localStorage.getItem(LOCAL_STORAGE_KEY);
  searchHistoryArray = local ? JSON.parse(local) : [];
}

let searchHistoryBtn = function (text) {
  let newButton = $("<button>");
  newButton.addClass("btn btn-outline-primary saved-search-btn");
  newButton.text(text);
  return newButton;
};

// Render the saved searches array
function renderSavedSearchButtons() {
  console.log(searchHistoryArray);
  for (let i = 0; i < searchHistoryArray.length; i++) {
    $("#saved-search-list").append(searchHistoryBtn(searchHistoryArray[i]));
  }
}

function getWeatherDataForCity(city) {
  let apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

  $.ajax({
    url: apiUrl,
    method: "GET",
  }).then(function (response) {
    console.log(response);
    let weatherTodayTempF = ktoF(response.list[0].main.temp);
    let weatherTodayFeelsLikeTemp = ktoF(response.list[0].main.feels_like);
    let lat = response.city.coord.lat;
    let lon = response.city.coord.lon;
    let windSpeedMetric = response.list[0].wind.speed;
    let windSpeedImperial = (windSpeedMetric * 2.237).toFixed(0);
    let deg = response.list[0].wind.deg;
    $("#todays-temperature").text(weatherTodayTempF);
    $("#todays-feels-like").text(weatherTodayFeelsLikeTemp);
    $("#todays-humidity").text(response.list[0].main.humidity);
    $("#todays-wind").text(windSpeedImperial + " mph ");
    $("#wind-dir-icon").css("transform", `rotate(${deg}deg)`);
    // uv index is from separate api
    let uvApiUrl = `http://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    $.ajax({
      url: uvApiUrl,
      method: "GET",
    }).then(function (response) {
      $("#todays-uv").text(response.value);
    });
  });
}

let ktoF = function (kelvin) {
  let f = kelvin * 1.8 - 459.67;
  return f.toFixed(0);
};

// let degToDirection = function (deg) {
//   deg = parseInt(deg);
//   let direction = "";
//   switch (true) {
//     case deg > 0 && deg <= 45:
//       direction = "NNE";
//       break;
//     case deg > 45 && deg <= 90:
//       direction = "E";
//       break;
//     case deg > 90 && deg <= 135:
//       direction = "SSE";
//       break;
//     case deg > 135 && deg <= 180:
//       direction = "S";
//       break;
//     case deg > 180 && deg <= 225:
//       direction = "SSW";
//       break;
//     case deg > 225 && deg <= 270:
//       direction = "W";
//       break;
//     case deg > 270 && deg <= 315:
//       console.log("test");
//       direction = "NNW";
//       break;
//     case (deg > 315 && deg <= 360) || deg === 0:
//       direction = "N";
//       break;
//   }

//   return direction;
// };

function setTodaysWeather() {}
