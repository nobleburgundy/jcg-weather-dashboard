const API_KEY = "b9e555b2714e9fd91e3ffa2b450b8030";
const LOCAL_STORAGE_KEY = "recent-weather-searches";
let searchHistoryArray = [];
let searchCity = "";
let defaultCity = "North Pole";
let data;
let lat;
let lon;
// let zipPattern = /\d+/;

$(document).ready(function () {
  localSearchHistroyFromLocalStorage();
  renderSavedSearchButtons();
  // By default just load the most recent searched city
  searchCity = searchHistoryArray[0] ? searchHistoryArray[0] : defaultCity;
  getWeatherDataForCity(searchCity);
});

$("#search-form").on("submit", function (event) {
  event.preventDefault();

  searchCity = $("#search-input").val();
  getWeatherDataForCity(searchCity);
  updateSearchHistory();
});

$(document).on("click", ".saved-search-btn", function () {
  searchCity = $(this).text();
  getWeatherDataForCity(searchCity);
  updateSearchHistory();
});

$(".navbar-toggler").on("click", function () {
  $("#search-sidebar").toggleClass("d-inline", "d-none");
});

function updateSearchHistory() {
  // Store search in an array if not already there
  if ($.inArray(searchCity, searchHistoryArray) > -1) {
    // if already in the array, remove it from the list and array, then move to the front
    let existingButton = $(`button:contains(${searchCity})`);
    existingButton.remove();

    // Remove from the array
    searchHistoryArray = searchHistoryArray.filter((text) => text !== searchCity);
  }

  // add it to the front of the array
  searchHistoryArray.unshift(searchCity);
  renderSavedSearchButtons();
  saveRecentSearchesToLocalStorage();
}

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
  newButton.addClass("btn btn-outline-primary btn-sm saved-search-btn");
  newButton.text(text);
  return newButton;
};

// Render the saved searches array
function renderSavedSearchButtons() {
  // load the 10 most recent
  let buttonsToLoad = searchHistoryArray.length < 10 ? searchHistoryArray.length : 10;
  $("#saved-search-list").empty();
  for (let i = 0; i < buttonsToLoad; i++) {
    $("#saved-search-list").append(searchHistoryBtn(searchHistoryArray[i]));
  }
}

function getWeatherDataForCity() {
  // use current weather api
  let currentWeatherAPI = `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${API_KEY}`;

  $.ajax({
    url: currentWeatherAPI,
    method: "GET",
  }).then(function (response) {
    let city = response.name;
    let dateUnix = response.dt;
    let date = moment.unix(dateUnix).format("dddd MM/D");
    $("#jumbo-city").text(city);
    $("#jumbo-date").text(date);
    let weatherTodayTempF = ktoF(response.main.temp);
    let weatherTodayFeelsLikeTemp = ktoF(response.main.feels_like);
    let weatherTodayLow = ktoF(response.main.temp_min);
    let weatherTodayHigh = ktoF(response.main.temp_max);
    lat = response.coord.lat;
    lon = response.coord.lon;
    let windSpeedMetric = response.wind.speed;
    let windSpeedImperial = (windSpeedMetric * 2.237).toFixed(0);
    let deg = response.wind.deg;
    let icon = response.weather[0].icon;
    $("#todays-temperature").text(weatherTodayTempF);
    $("#todays-low").text(weatherTodayHigh);
    $("#todays-high").text(weatherTodayLow);
    $("#todays-feels-like").text(weatherTodayFeelsLikeTemp);
    $("#todays-humidity").text(response.main.humidity);
    $("#todays-wind").text(windSpeedImperial + " mph ");
    $("#wind-dir-icon").css("transform", `rotate(${deg}deg)`);
    $("#jumbo-weather-icon").removeClass().addClass(weatherIconToFAIconMap(icon));
    // uv index is from separate api
    let uvApiUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    $.ajax({
      url: uvApiUrl,
      method: "GET",
    }).then(function (response) {
      let uvIndex = response.value;
      $("#todays-uv")
        .removeClass()
        .addClass(`uv-badge ${uvIndexClassMap(uvIndex)}`);
      $("#todays-uv").text(response.value);
    });
    setFiveDayForcast();
  });
}

function setFiveDayForcast() {
  // use forecast API
  let forecastAPI = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely,current,alerts&appid=${API_KEY}`;
  $.ajax({
    url: forecastAPI,
    method: "GET",
  }).then(function (response) {
    // loop through days, set the data
    for (let i = 1; i < 6; i++) {
      let dateUnix = response.daily[i].dt;
      let day = moment.unix(dateUnix).format("ddd");
      let date = moment.unix(dateUnix).format("MM/D");
      let temp = ktoF(response.daily[i].temp.max);
      let low = ktoF(response.daily[i].temp.min);
      let humidity = response.daily[i].humidity;
      let wind = response.daily[i].wind_speed;
      let windImperial = (wind * 2.237).toFixed(0);
      let openWeatherIcon = response.daily[i].weather[0].icon;

      // day and date
      $(`#five-day-${i}-day`).text(day);
      $(`#five-day-${i}-date`).text(date);
      // temp
      $(`#five-day-${i}-temp`).text(temp);
      $(`#five-day-${i}-low`).text(low);
      // humidity
      $(`#five-day-${i}-humidity`).text(humidity);
      // wind
      $(`#five-day-${i}-wind`).text(windImperial);
      // icon
      $(`#five-day-${i}-icon`).removeClass().addClass(weatherIconToFAIconMap(openWeatherIcon));
    }
  });
}

let weatherIconToFAIconMap = function (openWeatherIconCode) {
  let iconMap = {
    "01d": "fas fa-sun",
    "01n": "fas fa-moon",
    "02d": "fas fa-cloud-sun",
    "02n": "fas fa-cloud-moon",
    "03d": "fas fa-cloud",
    "03n": "fas fa-cloud-moon",
    "04d": "fas fa-cloud",
    "04n": "fas fa-cloud-moon",
    "09d": "fas fa-cloud-rain",
    "09d": "fas fa-cloud-moon-rain",
    "10d": "fas fa-cloud-showers-heavy",
    "10n": "fas fa-cloud-moon-rain",
    "11d": "fas fa-bolt",
    "11n": "fas fa-bolt",
    "13d": "fas fa-snowflake",
    "13n": "fas fa-snowflake",
    "50d": "fas fa-cloud",
    "50n": "fas fa-cloud-moon",
  };
  if (iconMap[openWeatherIconCode]) {
    return iconMap[openWeatherIconCode];
  }
  // if not return a default
  return "fas fa-cloud-sun";
};

let ktoF = function (kelvin) {
  let f = kelvin * 1.8 - 459.67;
  return f.toFixed(0);
};

let uvIndexClassMap = function (uvIndex) {
  if (uvIndex > 11) {
    // purple extreme
    return "extreme-uv";
  } else if (uvIndex > 7) {
    // red very high
    return "very-high-uv";
  } else if (uvIndex > 5) {
    // orange high
    return "high-uv";
  } else if (uvIndex > 3) {
    // yellow medium
    return "medium-uv";
  } else {
    // green low
    return "low-uv";
  }
};
