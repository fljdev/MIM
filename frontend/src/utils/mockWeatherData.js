// Mock Weather Data - Matches OpenWeatherMap API format EXACTLY
// Structure: https://openweathermap.org/current
// When ready, swap to real API by changing USE_REAL_APIS flag in apiHelpers.js

// Mock weather responses for different Dublin locations
// Key format: "lat_lng" (rounded to 2 decimals)
export const mockWeatherResponses = {
  // Dublin City Center - Rainy
  "53.35_-6.26": {
    coord: {
      lon: -6.26,
      lat: 53.35
    },
    weather: [
      {
        id: 501,
        main: "Rain",
        description: "moderate rain",
        icon: "10d"
      }
    ],
    base: "stations",
    main: {
      temp: 285.32,  // 12.17°C
      feels_like: 283.15,  // 10°C
      temp_min: 284.15,
      temp_max: 286.48,
      pressure: 1013,
      humidity: 87,
      sea_level: 1013,
      grnd_level: 1010
    },
    visibility: 8000,  // 8km visibility due to rain
    wind: {
      speed: 6.2,  // m/s
      deg: 240,
      gust: 10.3
    },
    rain: {
      "1h": 3.5  // 3.5mm in last hour
    },
    clouds: {
      all: 90  // 90% cloud cover
    },
    dt: Date.now() / 1000,  // Current timestamp
    sys: {
      type: 2,
      id: 2001,
      country: "IE",
      sunrise: 1730617200,  // 7:00 AM
      sunset: 1730656800    // 5:00 PM (shorter winter days)
    },
    timezone: 0,  // UTC for Ireland
    id: 2964574,
    name: "Dublin",
    cod: 200
  },

  // Temple Bar area - Light Rain
  "53.34_-6.26": {
    coord: {
      lon: -6.26,
      lat: 53.34
    },
    weather: [
      {
        id: 500,
        main: "Rain",
        description: "light rain",
        icon: "10d"
      }
    ],
    base: "stations",
    main: {
      temp: 286.15,  // 13°C
      feels_like: 284.26,
      temp_min: 285.15,
      temp_max: 287.15,
      pressure: 1015,
      humidity: 82,
      sea_level: 1015,
      grnd_level: 1012
    },
    visibility: 9000,
    wind: {
      speed: 5.5,
      deg: 225,
      gust: 8.7
    },
    rain: {
      "1h": 1.2
    },
    clouds: {
      all: 75
    },
    dt: Date.now() / 1000,
    sys: {
      type: 2,
      id: 2001,
      country: "IE",
      sunrise: 1730617200,
      sunset: 1730656800
    },
    timezone: 0,
    id: 2964574,
    name: "Dublin",
    cod: 200
  },

  // Trinity College area - Cloudy
  "53.34_-6.25": {
    coord: {
      lon: -6.25,
      lat: 53.34
    },
    weather: [
      {
        id: 803,
        main: "Clouds",
        description: "broken clouds",
        icon: "04d"
      }
    ],
    base: "stations",
    main: {
      temp: 287.15,  // 14°C
      feels_like: 285.93,
      temp_min: 286.48,
      temp_max: 288.15,
      pressure: 1016,
      humidity: 76,
      sea_level: 1016,
      grnd_level: 1013
    },
    visibility: 10000,  // Clear 10km visibility
    wind: {
      speed: 4.1,
      deg: 210,
      gust: 6.7
    },
    clouds: {
      all: 65
    },
    dt: Date.now() / 1000,
    sys: {
      type: 2,
      id: 2001,
      country: "IE",
      sunrise: 1730617200,
      sunset: 1730656800
    },
    timezone: 0,
    id: 2964574,
    name: "Dublin",
    cod: 200
  },

  // Phoenix Park - Partly Cloudy (Good weather)
  "53.36_-6.33": {
    coord: {
      lon: -6.33,
      lat: 53.36
    },
    weather: [
      {
        id: 802,
        main: "Clouds",
        description: "scattered clouds",
        icon: "03d"
      }
    ],
    base: "stations",
    main: {
      temp: 288.15,  // 15°C
      feels_like: 287.04,
      temp_min: 287.15,
      temp_max: 289.26,
      pressure: 1017,
      humidity: 71,
      sea_level: 1017,
      grnd_level: 1014
    },
    visibility: 10000,
    wind: {
      speed: 3.6,
      deg: 180,
      gust: 5.2
    },
    clouds: {
      all: 40
    },
    dt: Date.now() / 1000,
    sys: {
      type: 2,
      id: 2001,
      country: "IE",
      sunrise: 1730617200,
      sunset: 1730656800
    },
    timezone: 0,
    id: 2964574,
    name: "Dublin",
    cod: 200
  },

  // Dun Laoghaire - Clear (Rare!)
  "53.29_-6.13": {
    coord: {
      lon: -6.13,
      lat: 53.29
    },
    weather: [
      {
        id: 800,
        main: "Clear",
        description: "clear sky",
        icon: "01d"
      }
    ],
    base: "stations",
    main: {
      temp: 289.15,  // 16°C
      feels_like: 288.21,
      temp_min: 288.15,
      temp_max: 290.37,
      pressure: 1018,
      humidity: 68,
      sea_level: 1018,
      grnd_level: 1015
    },
    visibility: 10000,
    wind: {
      speed: 2.8,
      deg: 150,
      gust: 4.1
    },
    clouds: {
      all: 5
    },
    dt: Date.now() / 1000,
    sys: {
      type: 2,
      id: 2001,
      country: "IE",
      sunrise: 1730617200,
      sunset: 1730656800
    },
    timezone: 0,
    id: 2964353,
    name: "Dún Laoghaire",
    cod: 200
  }
};

// Helper function to get weather for a location
export const getMockWeather = (lat, lng) => {
  // Round to 2 decimal places to match our keys
  const key = `${lat.toFixed(2)}_${lng.toFixed(2)}`;
  
  // Return mock data if we have it
  if (mockWeatherResponses[key]) {
    return mockWeatherResponses[key];
  }
  
  // Default to typical Dublin cloudy weather
  return {
    coord: {
      lon: lng,
      lat: lat
    },
    weather: [
      {
        id: 803,
        main: "Clouds",
        description: "broken clouds",
        icon: "04d"
      }
    ],
    base: "stations",
    main: {
      temp: 286.15,  // 13°C - typical Dublin temp
      feels_like: 284.26,
      temp_min: 285.15,
      temp_max: 287.15,
      pressure: 1015,
      humidity: 78,
      sea_level: 1015,
      grnd_level: 1012
    },
    visibility: 9000,
    wind: {
      speed: 4.5,
      deg: 220,
      gust: 7.2
    },
    clouds: {
      all: 70
    },
    dt: Date.now() / 1000,
    sys: {
      type: 2,
      id: 2001,
      country: "IE",
      sunrise: 1730617200,
      sunset: 1730656800
    },
    timezone: 0,
    id: 2964574,
    name: "Dublin",
    cod: 200
  };
};

// Helper to check if weather is suitable for walking/biking
export const isWeatherGoodForOutdoorTransit = (weatherData) => {
  const weatherId = weatherData.weather[0].id;
  const windSpeed = weatherData.wind.speed;
  
  // Bad weather conditions (rain, snow, thunderstorm)
  if (weatherId >= 200 && weatherId < 700) {
    return false;
  }
  
  // High winds (over 10 m/s is uncomfortable for cycling)
  if (windSpeed > 10) {
    return false;
  }
  
  return true;
};

// Helper to get human-readable weather warning
export const getWeatherWarning = (weatherData) => {
  const main = weatherData.weather[0].main;
  const description = weatherData.weather[0].description;
  const temp = weatherData.main.temp - 273.15;  // Convert Kelvin to Celsius
  const windSpeed = weatherData.wind.speed;
  
  if (main === "Rain") {
    return `⚠️ ${description.charAt(0).toUpperCase() + description.slice(1)} expected - consider transit or driving`;
  }
  
  if (main === "Thunderstorm") {
    return "⚠️ Thunderstorm warning - avoid walking/cycling";
  }
  
  if (main === "Snow") {
    return "⚠️ Snow conditions - drive carefully or use transit";
  }
  
  if (windSpeed > 10) {
    return "⚠️ High winds - cycling not recommended";
  }
  
  if (temp < 5) {
    return "⚠️ Cold weather - dress warmly";
  }
  
  if (temp > 25) {
    return "☀️ Hot weather - stay hydrated";
  }
  
  return null;  // No warning needed
};
