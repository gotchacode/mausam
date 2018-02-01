#! /usr/bin/env node

const https = require('https');
const http = require('http');
const geoipURI = `https://telize.j3ss.co/geoip`;
const APIKEY = process.env.WUNDER_KEY;


console.log('APIKEY', APIKEY);
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

        if (statusCode !== 200) {
          error = new Error('Request failed to complete');
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
            const weatherData = JSON.parse(rawWeatherData)
            console.log(weatherData);
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



const [,, ...args] = process.argv;

console.log(`Hello World ${args}`);

