let apiKey = "b9e555b2714e9fd91e3ffa2b450b8030";
let weatherArray = [0, 1, 2, 3, 4, 5];

$("#search-form").on("submit", function (event) {
  event.preventDefault();

  let searchText = $("#search-input").val();
  $("#jumbo-city").text(searchText);
  getWeatherDataForCity(searchText);

  // Prepend the search as a saved button
  let newSearchButton = $("<button>");
  newSearchButton.addClass("btn btn-outline-secondary saved-search-btn").text(searchText);
  $("#saved-search-list").prepend(newSearchButton);
});

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
