export const getBoundingBox = (feature) => {
    var bounds = {}, coordinates, latitude, longitude;
  
    // Loop through each "feature"
    coordinates = feature.geometry.coordinates;
  
    if (coordinates.length === 1) {
      // It's only a single Polygon
      // For each individual coordinate in this feature's coordinates...
      for (var j = 0; j < coordinates[0].length; j++) {
        longitude = coordinates[0][j][0];
        latitude = coordinates[0][j][1];
  
        // Update the bounds recursively by comparing the current xMin/xMax and yMin/yMax with the current coordinate
        bounds.xMin = bounds.xMin < longitude ? bounds.xMin : longitude;
        bounds.xMax = bounds.xMax > longitude ? bounds.xMax : longitude;
        bounds.yMin = bounds.yMin < latitude ? bounds.yMin : latitude;
        bounds.yMax = bounds.yMax > latitude ? bounds.yMax : latitude;
      }
    } else {
      // It's a MultiPolygon
      // Loop through each coordinate set
      for (var h = 0; h < coordinates.length; h++) {
        // For each individual coordinate in this coordinate set...
        for (var k = 0; k < coordinates[h][0].length; k++) {
          longitude = coordinates[h][0][k][0];
          latitude = coordinates[h][0][k][1];
  
          // Update the bounds recursively by comparing the current xMin/xMax and yMin/yMax with the current coordinate
          bounds.xMin = bounds.xMin < longitude ? bounds.xMin : longitude;
          bounds.xMax = bounds.xMax > longitude ? bounds.xMax : longitude;
          bounds.yMin = bounds.yMin < latitude ? bounds.yMin : latitude;
          bounds.yMax = bounds.yMax > latitude ? bounds.yMax : latitude;
        }
      }
    }
  
    // Returns an object that contains the bounds of this GeoJSON data.
    // The keys describe a box formed by the northwest (xMin, yMin) and southeast (xMax, yMax) coordinates.
    // const southWest = L.latLng(bounds.yMin, bounds.xMin),
    // northEast = L.latLng(bounds.yMax, bounds.xMax);
    // return L.latLngBounds(southWest, northEast);
    const bound = [[bounds.xMin, bounds.yMin], [bounds.xMax, bounds.yMax]];
    const center = [(bounds.xMax + bounds.xMin) / 2, (bounds.yMax + bounds.yMin) / 2]
  
    return [bound, center]
  }
  
  export const getGeoJson = (data) => {
    var pinsGeoJson = {
      "type": "FeatureCollection",
      "features": []
    }
  
    pinsGeoJson.features = data.points.map((pin, index) => {
      return { "type": "Feature", "properties": {"name": pin.name, "description": pin.description, 'pintype': index%2?'true':'false' }, "geometry": { "type": "Point", "coordinates": [pin.lon, pin.lat] } }
    })
  
    return pinsGeoJson
  }
  