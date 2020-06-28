$(document).ready(function () {
    $("#srcBtn").on("click", function () {

        var searchValue = $("#search-city").val();

        // clear input
        $("#search-city").val("");
        findWeather(searchValue);
    });

    $(".history").on("click", "li", function () {
        findWeather($(this).text());
    });

    function addRow(text) {
        var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
        $(".history").append(li);
    }

    // search history
    var history = JSON.parse(window.localStorage.getItem("history")) || [];

    if (history.length > 0) {
        findWeather(history[history.length - 1]);
    }
    for (var i = 0; i < history.length; i++) {
        addRow(history[i]);
    }

    var weatherApi = ("277bca18f503f085e17236bfb3fbc6f0&units=metric");

    function findWeather(searchValue) {
        $.ajax({
            type: "GET",
            url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=" + weatherApi,
            dataType: "json",
            success: function (data) {
                // make past searches clickable
                if (history.indexOf(searchValue) === -1) {
                    history.push(searchValue);
                    window.localStorage.setItem("history", JSON.stringify(history));
                    addRow(searchValue);
                }

                // clear main box content
                $("#today").empty();

                // display weather from search
                var city = $("<h2>").addClass("city-header").text(data.name + " (" + new Date().toLocaleDateString() + ")");
                var card = $("<div>").addClass("card");
                var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " KMH");
                var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
                var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °C");
                var cardBody = $("<div>").addClass("card-body");
                var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

                city.append(img);
                cardBody.append(city, temp, humid, wind);
                card.append(cardBody);
                $("#today").append(card);
                getForecast(searchValue);
                getUV(data.coord.lat, data.coord.lon);
            }
        });
    }

    function getForecast(searchValue) {
        $.ajax({
            type: "GET",
            url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=" + weatherApi,
            dataType: "json",
            success: function (data) {
                // change old content
                $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

                // loop over all forecasts (by 3-hour increments)
                for (var i = 0; i < data.list.length; i++) {
                    // only look at forecasts around 3:00pm
                    if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                        // create html elements for a bootstrap card
                        var col = $("<div>").addClass("col-md-2");
                        var card = $("<div>").addClass("card text-white bg-primary");
                        var body = $("<div>").addClass("card-body p-1");
                        var title = $("<h7>").addClass("city-header").text(new Date(data.list[i].dt_txt).toLocaleDateString());
                        var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
                        var degrees = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °C");
                        var humidTwo = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

                        // merge together and put on page
                        col.append(card.append(body.append(title, img, degrees, humidTwo)));
                        $("#forecast .row").append(col);
                    }
                }
            }
        });
    }

    function getUV(lat, lon) {
        $.ajax({
            type: "GET",
            url: "https://api.openweathermap.org/data/2.5/uvi?appid=277bca18f503f085e17236bfb3fbc6f0&lat=" + lat + "&lon=" + lon,
            dataType: "json",
            success: function (data) {
                var uv = $("<p>").text("UV Index: ");
                var btn = $("<span>").addClass("btn btn-sm").text(data.value);

                // UV colour change
                if (data.value < 3) {
                    btn.addClass("btn-success");
                }
                else if (data.value < 6) {
                    btn.addClass("btn-warning");
                }
                else {
                    btn.addClass("btn-danger");
                }

                $("#today .card-body").append(uv.append(btn));
            }
        });
    }
});  