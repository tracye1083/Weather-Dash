let city = $("#userCity").val().trim();
let iconw = $("#wicon");
let timeNow = moment().format('l');
let bttnSearch = $("#bttnSearch");
let savedData = localStorage.getItem("searchedCities");
let searchedCities = [];


//displays search history on left side
if (savedData) {
    searchedCities = JSON.parse(savedData);
    displaySearchHistory();
    searchedCities[0];
    loadFirstCity();

} else {
    searchedCities = [];
}

function displaySearchHistory() {
    cityRows.empty();
    searchedCities.forEach(function(city) {
        let divCityEl = $("<div>").addClass('col-12 city');

        let buttonCityEl = $('<button>').addClass('btn btn-light').text(city);

        divCityEl.append(buttonCityEl);

        cityRows.append(divCityEl);
    });
}

//save search results to local storage
function saveSearchResults(event) {

    const prevSearchIndex = searchedCities.indexOf(city); //returns first element of searchedcities array
    const notSearched = prevSearchIndex === -1; //prevSearchIndex is strictly equal to -1
    if (notSearched) {
        searchedCities.unshift(city); //searchedcities adds new city to beginning of array

        //strinify and set "cities" in local storage to searchedcities array
        localStorage.setItem('searchedCities', JSON.stringify(searchedCities));
    } else {
        const removed = searchedCities.splice(prevSearchIndex, 1); //searchedcities adds cities to prevSearchIndex
        searchedCities.unshift(removed.pop()); //searchedcities adds new city to array(removed removes last element and returns it);
    }
}



function displayLastSearchedCity() {
    if (searchedCities[0]) {
        let queryURL = buildURLFromId(searchedCities[0].id);
        searchWeather(queryURL);
    } else {
        // if no past searched cities, load Boston, MA weather data
        let queryURL = buildURLFromInputs("Boston", "MA", "US");
        searchWeather(queryURL);
    }
}
//hides the content when page loads.
$(".containerConditions").hide();
$(".daysForecastheader").hide();
$(".daysForecast").hide();

bttnSearch.on('click', currentConditions);

function currentConditions(event) {
    event.preventDefault();

    //setting the city searched in the localstorage

    // local storage functions
    function loadCities() {
        const storedCities = JSON.parse(localStorage.getItem('searchedCities'));
        if (storedCities) {
            searchedCities = storedCities;
        }
    }

    function storeCities() {
        localStorage.setItem('searchedCities', JSON.stringify(searchedCities));
    }

    //sets the user's parameter and sets api for the Ajax Call
    let city = $("#userCity").val().trim();
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=f042c27bf197a3b291c2290d80b2dd40";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {

        //content now it's displayed with the response we got back
        $(".containerConditions").show();
        $(".daysForecastheader").show();
        $(".daysForecast").show();

        //creating a variable for each info I want to display in my page
        let cityName = response.name;
        let temperature = response.main.temp.toFixed(0);
        let humidity = response.main.humidity;
        let windSpeed = response.wind.speed;
        let lon = response.coord.lon;
        let lat = response.coord.lat;

        uvIndex(lat, lon)

        //creating  elements and appending the information stored in the variables above
        let $currentConditions = $("<div>");
        let $cityName = $("<h3>").text(cityName).append(" " + timeNow);
        let $temperature = $("<p>").text("Temperature: " + temperature + "??F");
        let $humidity = $("<p>").text("Humidity: " + humidity + "%");
        let $windSpeed = $("<p>").text("Wind Speed: " + windSpeed + " MPH");

        iconw.attr("src", "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png");
        $cityName.attr("style", "font-weight: bolder");

        $("#currentConditions").empty()

        $("#iconSpan").append(iconw);
        iconw.attr("style", "font-size:10em")

        $currentConditions.prepend($cityName, $temperature, $humidity, $windSpeed)
        $("#currentConditions").append($currentConditions);

        let recentSearch = $("<button>").text(cityName);
        recentSearch.addClass("level-left level-item button is-info city");
        $("#recentSearches").prepend(recentSearch);

        // let citiesSearched = JSON.parse(localStorage.getItem("city-search") || [])
        // citiesSearched.push(recentSearch);
        // localStorage.setItem("city-search", JSON.stringify(citiesSearched));
    })
    recentSearches();
    forecast5Days()


    function forecast5Days() {
        let city = $("#userCity").val().trim();
        // let city = "Penacook"
        let queryURLForecast = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&appid=f042c27bf197a3b291c2290d80b2dd40";

        $.ajax({
            url: queryURLForecast,
            method: "GET"
        }).then(function(response) {
            let forecastCount = 1;
            for (let i = 0; i < response.list.length; i++) {
                let checkTime = moment(response.list[i].dt_txt).format("HH");
                if (checkTime == 00) {
                    $("#date" + forecastCount).text(moment(response.list[i].dt_txt).format("l"));
                    $("#temperature" + forecastCount).text("Temperature " + response.list[i].main.temp.toFixed(0) + "??F");
                    $("#wicon" + forecastCount).attr("src", "https://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png")
                    $("#humidity" + forecastCount).text("Humidity " + response.list[i].main.humidity + "%");
                    forecastCount++
                }
            }
        })
    }

    function recentSearches(cityInput) {
        let citySearch = $("#userCity").val().trim();
        if (!citySearch) {
            alert("Please enter a city")
            return false;
        }
    }

    function uvIndex(lat, lon) {
        let queryURLUvIndex = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=f042c27bf197a3b291c2290d80b2dd40";

        $.ajax({
            url: queryURLUvIndex,
            method: "GET"
        }).then(function(response) {
            console.log(response.value)
            let uvIndex = response.value
            let $uvIndex = $("<p>").addClass("uv-index").text("Uv Index: " + uvIndex);
            $("#currentConditions").append($uvIndex)
            let uvColor = setUVIndexColor(uvIndex);
            let uvIndexEl = $(".uv-index");
            uvIndexEl.text(response.value);
            uvIndexEl.attr('style', `background-color: ${uvColor}; color: ${uvColor === "yellow" ? "black" : "white"}`);
        })
    }

    function setUVIndexColor(uvi) {
        if (uvi < 3) {
            return 'green';
        } else if (uvi >= 3 && uvi < 6) {
            return 'yellow';
        } else if (uvi >= 6 && uvi < 8) {
            return 'orange';
        } else if (uvi >= 8 && uvi < 11) {
            return 'red';
        } else return 'purple';
    }

}

//click button to see past searches
// $(document).on('click', '.city', function(event) {
//     lastCitySearched = event.target.innerHTML;
//     apiReload();