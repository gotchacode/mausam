#! /usr/bin/env node

const https = require('https');
const geoipURI = `https://telize.j3ss.co/geoip`;

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
      console.log(parsedData);
    } catch(e) {
      console.log(e.message);
    }
  });
});



const [,, ...args] = process.argv;

console.log(`Hello World ${args}`);

