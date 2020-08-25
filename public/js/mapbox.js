/*eslint-disable*/

export const mapbox = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZmFkaWxsYWhhemhhcmRrIiwiYSI6ImNrZG11YzY2ODBtZzcyc3FpdTVvNHJnMDIifQ.2J9VYIS4enTbF1DB75xaaQ';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/fadillahazhardk/ckdnc2z2z0yc11ioi5fmigz4v',
    scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    //Create marker element
    const el = document.createElement('div');
    el.className = 'marker';

    //Add marker to the map
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    //Extend map bound to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 200,
      left: 100,
      right: 100
    }
  });
};
