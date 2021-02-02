let cities = [];
let selectedCity = {};
async function getCities() {
  let response = await fetch("data/city.list.json");
  let json = await response.json();
  cities = json.map((item) => {
    return { name: item.name, country: item.country, id: item.id };
  });
}

function autocomplete(input, arr) {
  var currentFocus;
  input.addEventListener("input", function (e) {
    closeAllLists();
    selectedCity = {};
    var location = this.value;
    if (!location) {
      return false;
    }
    currentFocus = -1;
    var autocompleteList = document.createElement("div");
    autocompleteList.setAttribute("id", this.id + "autocomplete-list");
    autocompleteList.setAttribute("class", "autocomplete-items");
    this.parentNode.appendChild(autocompleteList);
    var itemCount = 0;
    for (var i = 0; i < arr.length; i++) {
      if (
        arr[i].name.substr(0, location.length).toUpperCase() ==
          location.toUpperCase() &&
        itemCount < 10
      ) {
        var item = document.createElement("div");
        item.innerHTML =
          "<strong>" + arr[i].name.substr(0, location.length) + "</strong>";
        item.innerHTML +=
          arr[i].name.substr(location.length) + ", " + arr[i].country;
        item.innerHTML += "<input type='hidden' value='" + arr[i].name + "'>";
        item.innerHTML +=
          "<input type='hidden' value='" + arr[i].country + "'>";
        item.innerHTML += "<input type='hidden' value='" + arr[i].id + "'>";
        item.addEventListener("click", function (e) {
          input.value = this.getElementsByTagName("input")[0].value;
          let country = this.getElementsByTagName("input")[1].value;
          let id = this.getElementsByTagName("input")[2].value;
          selectedCity = { location: input.value, country, id };
          closeAllLists();
        });
        autocompleteList.appendChild(item);
        itemCount++;
      }
    }
  });
  input.addEventListener("keydown", function (e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      currentFocus++;
      addActive(x);
    } else if (e.keyCode == 38) {
      currentFocus--;
      addActive(x);
    } else if (e.keyCode == 13) {
      e.preventDefault();
      if (currentFocus > -1) {
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != input) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

getCities().then((data) => {
  autocomplete(document.getElementById("location"), cities);
});

function getCityId(city) {
  let cityFound = cities.find((elem) => {
    return elem.name.toUpperCase() == city.toUpperCase();
  });
  return cityFound ? cityFound.id : -1;
}
async function fillCityData(id) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=31aacefbb663efad6c58dd73c8163725&units=metric`
  );
  const resultDiv = document.querySelector(".result-box");
  resultDiv.innerHTML = "";
  let json = "";
  let city = "";
  let country = "";
  let temperature = "";
  let icon = "";
  if (id != -1) {
    json = await response.json();
    city = json.name;
    country = json.sys.country;
    temperature = Math.floor(json.main.temp);
    icon = json.weather[0].icon;
  } else {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("result-card");
    const cityH1 = document.createElement("h1");
    cityH1.textContent = `City not found`;
    cardDiv.appendChild(cityH1);
    resultDiv.appendChild(cardDiv);
    return;
  }

  const cardDiv = document.createElement("div");
  cardDiv.classList.add("result-card");
  const cityH1 = document.createElement("h1");
  cityH1.textContent = `${city}, ${country}`;
  const temperatureDiv = document.createElement("div");
  temperatureDiv.classList.add("temperature");
  const temperatureSpan = document.createElement("span");
  temperatureSpan.textContent = `${temperature}°C`;
  const imageIcon = document.createElement("img");
  imageIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  temperatureDiv.appendChild(temperatureSpan);
  temperatureDiv.appendChild(imageIcon);
  cardDiv.appendChild(cityH1);
  cardDiv.appendChild(temperatureDiv);
  resultDiv.appendChild(cardDiv);
}

document.getElementById("search").addEventListener("submit", (e) => {
  e.preventDefault();
  let locationInput = document.getElementById("location");
  cityId = selectedCity.id || getCityId(locationInput.value);
  fillCityData(cityId);
  locationInput.value = "";
  selectedCity = {};
});
