const maptilerClient = require("@maptiler/client");
const CustomError = require("./CustomError");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

async function getCoordinate(place) {
  try {
    const result = await maptilerClient.geocoding.forward(place, { limit: 1 });
    const geometry = result.features[0].geometry;
    return geometry;
  } catch (e) {
    new CustomError("500", "Geocoding Error");
  }
}

module.exports = { getCoordinate };
