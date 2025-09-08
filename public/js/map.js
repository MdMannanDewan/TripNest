maptilersdk.config.apiKey = MapApiKey;
const map = new maptilersdk.Map({
  container: "map", // container's id or the HTML element in which the SDK will render the map
  style: maptilersdk.MapStyle.STREETS,
  center: coordinates, // starting position [lng, lat]
  zoom: 14, // starting zoom
});

new maptilersdk.Marker({ color: "#FF0000" }).setLngLat(coordinates).addTo(map);
