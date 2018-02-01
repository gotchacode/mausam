#! /usr/bin/env node

const https = require('https');
const http = require('http');
const imgcat = require('imgcat');
const geoipURI = `https://telize.j3ss.co/geoip`;
const APIKEY = process.env.WUNDER_KEY;

function urlBuilder(type, location) {
  return `http://api.wunderground.com/api/${APIKEY}/${type}/q/${location.lat},${location.lng}.json`;
}

https.get(geoipURI, (res) => {
  const { statusCode } = res;
  let error;
  if (statusCode !== 200) {
    error = new Error('Request Failed');
  }

  if (error) {
    console.log(error.message);
    res.resume();
    return;
  }

  res.setEncoding('utf8');

  let rawData = '';

  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(rawData);
      let location = {
        lat: parsedData.latitude,
        lng: parsedData.longitude
      };
      const weatherURL = urlBuilder('conditions/forecast/astronomy', location);
      http.get(weatherURL, (res) => {
        const { statusCode } = res;
        let error;
        const contentType = res.headers['content-type'];
        if (statusCode !== 200) {
          error = new Error('Request failed to complete');
        } else if (!/^application\/json/.test(contentType)) {
          error = new Error('Invalid content-type.\n' +
                            `Expected application/json but received ${contentType}`);
        }

        if (error) {
          console.log(error.message);
          res.resume();
          return;
        }

        res.setEncoding('utf8');
        let rawWeatherData = '';

        res.on('data', (chunk) => { rawWeatherData += chunk; });
        res.on('end', () => {
          try {
            const weatherData = JSON.parse(rawWeatherData);
            renderWeather(weatherData.current_observation);
          } catch (e) {
            console.log(e.message);
          }
        });


      });
    } catch(e) {
      console.log(e.message);
    }
  });
});


const renderWeather = (data) => {
  let currentWeather = `Current weather is ${data.weather} in ${data.display_location.full} for ${data.observation_time}. The temperature is ${data.temp_c}°C and feels like ${data.feelslike_c}°C`;
  let humidity = `The humidity is ${data.relative_humidity}`;
  let windSpeed = `The wind is ${data.wind_string} and blowing at a speed of ${data.wind_kph} km/hr`;
  let visibility = `The visibility is ${data.visibility_km} kms`;
  const pressure = `Current pressure is ${data.pressure_mb} mbar`;
  console.log(currentWeather);
  console.log('\n');
  console.log('\n');
  console.log(humidity);
  console.log(windSpeed);
  console.log(visibility);
  console.log(pressure);
  console.log('\n');
  console.log(`Powered by: ${data.image.title}`);
  imgcat(data.image.url, {log: true})
  console.log(`Link: ${data.image.link}`);
};