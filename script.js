$(document).ready(function() {
  $("#search-button").on("click", function() {
    var inputCity = $("#input-city").val();

    searchOpenWeather(inputCity);
    
    // clears input box
    $("#input-city").val("");
  });

  $(".searchHistory").on("click", "li", function() {
    searchOpenWeather($(this).text());
  });

  function addToSearchHistory(nameOfCity) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(nameOfCity);
    $(".searchHistory").append(li);
  }

  function searchOpenWeather(inputCity) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + inputCity + "&appid=779f16fce6ffa8c704fece84b9e27a29&units=imperial",
      dataType: "json",
      success: function(data) {
        // create history link for this search
        if (history.indexOf(inputCity) === -1) {
          history.push(inputCity);
          window.localStorage.setItem("searchHistory", JSON.stringify(history));
    
          addToSearchHistory(inputCity);
        }
        
        // clear previous content
        $("#currentWeather").empty();

        // create html content for current weather
        var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        var card = $("<div>").addClass("card");
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        var cardBody = $("<div>").addClass("card-body");
        var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        // add data to card, add card to page
        title.append(img);
        cardBody.append(title, temp, humid, wind);
        card.append(cardBody);
        $("#currentWeather").append(card);

        // call follow-up api endpoints
        getForecast(inputCity);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
  
  function getForecast(inputCity) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + inputCity + "&appid=779f16fce6ffa8c704fece84b9e27a29&units=imperial",
      dataType: "json",
      success: function(data) {
        // overwrite any existing content with title and empty row
        $("#fiveDayForecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            var col = $("<div>").addClass("col-md-2");
            var card = $("<div>").addClass("card bg-light text-black");
            var body = $("<div>").addClass("card-body p-2");

            var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());

            var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");

            var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
            var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

            // merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            $("#fiveDayForecast .row").append(col);
          }
        }
      }
    });
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/uvi?appid=779f16fce6ffa8c704fece84b9e27a29&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      success: function(data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // change color depending on uv value
        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        else {
          btn.addClass("btn-danger");
        }
        
        $("#currentWeather .card-body").append(uv.append(btn));
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("searchHistory")) || [];

  if (history.length > 0) {
    searchOpenWeather(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    addToSearchHistory(history[i]);
  }
});
