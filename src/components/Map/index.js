import React, { useState, useRef, useEffect } from 'react'
import MapGL, { Source, Layer, LinearInterpolator, Popup, NavigationControl } from 'react-map-gl'
import WebMercatorViewport from 'viewport-mercator-project';
import { getBoundingBox, getGeoJson } from './utils'
import countryGeo from '../../data/countryGeo.json'

const token = "pk.eyJ1IjoidG9tc2Jyb3duIiwiYSI6ImNrM2ZsMHZncjA2MGMza29mOWZ0NGsyc20ifQ.DlNvvuGwOxpRPKAHfYT7iQ"
const navStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  padding: '10px'
};

const Map = ({ pins }) => {
  const zoomThreshold = 4;
  const [viewport, setViewPort] = useState({
    width: "100%",
    height: '98vh',
    latitude: 50,
    longitude: -90,
    zoom: 2,
    minZoom: 2,
    maxZoom: 12
  })
  const mapRef = useRef(null)
  const [pinsGeo, setPinsGeo] = useState({})
  const [popUp, setPopUp] = useState(null)

  useEffect(() => {
    countryGeo.features.map(feature => feature.properties.bound = getBoundingBox(feature))
    setPinsGeo(getGeoJson(pins))
  }, [])

  const setFitBounds = (bounds) => {
    const viewportEl = new WebMercatorViewport(viewport);
    const { longitude, latitude, zoom } = viewportEl.fitBounds(bounds, {
      padding: 40
    });

    setViewPort({
      ...viewport,
      longitude,
      latitude,
      zoom,
      transitionDuration: 400
    })
  }

  const _onViewportChange = viewport => setViewPort({ ...viewport })
  const eventListner = (e) => {
    const featureObj =  e.features[0]
    const currentZoom = mapRef.current.props.zoom;

    if (typeof featureObj !== "undefined") {
      const layerId = featureObj.layer.id;
      if (layerId === 'company-circle') {
        setPopUp({
          pos: featureObj.geometry.coordinates,
          description: featureObj.properties.description
        })
      } else {
        const bounds = getBoundingBox(featureObj)
        if (layerId === 'county-population') {
          setFitBounds(bounds[0])
        }
        else if (layerId === 'state-population') {
          setFitBounds(bounds[0])
        }
        else if (layerId === 'boundary') {
          setFitBounds(JSON.parse(e.features[0].properties.bound)[0])
        }
        setPopUp(null)
      }
    }
  }

  return (
    <div style={{ margin: '0 auto' }}>
      <MapGL
        {...viewport}
        mapboxApiAccessToken={token}
        mapStyle="mapbox://styles/mapbox/dark-v10"
        onViewportChange={_onViewportChange}
        ref={mapRef}
        onClick={eventListner}
      >

        {/* Add Sources */}
        <Source id="population" type="vector" url="mapbox://mapbox.660ui7x6" />
        <Source id="country-source" type="geojson" data={countryGeo} />
        <Source id="company-geo" type="geojson" data={pinsGeo} />

        {/* Add Layers */}
        {/* Country Area */}
        <Layer
          id="boundary"
          type="fill"
          source="country-source"
          paint={{
            "fill-color": "#888888",
            "fill-opacity": 0
          }}
        />
        <Layer
          id="boundary-highlighted"
          type="fill"
          source="country-source"
          paint={{
            "fill-color": "#888888",
            "fill-opacity": 0
          }}
          filter={["in", "name", ""]}
        />
        <Layer
          id="boundary-border"
          type="line"
          source="country-source"
          filter={["==", "postal", ""]}
          paint={{
            'line-color': 'gray',
            'line-width': ['interpolate', ['linear'], ['zoom'], 0, 1, 20, 6]
          }}
        />

        <Layer
          id="boundary-border-highlighted"
          type="line"
          source="country-source"
          filter={["in", "FIPS", ""]}
          paint={{
            'line-color': 'darkgray',
            'line-width': ['interpolate', ['linear'], ['zoom'], 0, 1, 20, 5]
          }}
        />

        {/* State Area */}
        <Layer
          id="state-population"
          type="fill"
          source="population"
          source-layer="state_county_population_2014_cen"
          maxzoom={zoomThreshold}
          filter={['==', 'isState', true]}
          paint={{
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'population'],
              0, '#F2F12D',
              500000, '#EED322',
              750000, '#E6B71E',
              1000000, '#DA9C20',
              2500000, '#CA8323',
              5000000, '#B86B25',
              7500000, '#A25626',
              10000000, '#8B4225',
              25000000, '#723122'
            ],
            'fill-opacity': 1
          }}
        />

        <Layer
          id="state-population-bounder"
          source="population"
          source-layer="state_county_population_2014_cen"
          minzoom={2}
          type="line"
          filter={['==', 'isState', true]}
          paint={{
            'line-color': 'darkgray',
            'line-width': ['interpolate', ['linear'], ['zoom'], 0, 1, 20, 6]
          }}
        />

        {/* County Area */}
        <Layer
          id="county-population"
          source="population"
          source-layer="state_county_population_2014_cen"
          minzoom={zoomThreshold}
          type="fill"
          filter={['==', 'isCounty', true]}
          paint={{
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'population'],
              0, '#F2F12D',
              100, '#EED322',
              1000, '#E6B71E',
              5000, '#DA9C20',
              10000, '#CA8323',
              50000, '#B86B25',
              100000, '#A25626',
              500000, '#8B4225',
              1000000, '#723122'
            ],
            'fill-opacity': 0.75
          }}
        />

        {/* Heatmap Area */}
        <Layer
          id="company-heat"
          type="heatmap"
          source="company-geo"
          maxzoom={10}
          paint={{
            'heatmap-intensity': {
              stops: [
                [8, 1],
                [11, 2]
              ]
            },
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(236,222,239,0)',
              0.2, 'rgb(208,209,230)',
              0.4, 'rgb(166,189,219)',
              0.6, 'rgb(103,169,207)',
              0.8, 'rgb(28,144,153)'
            ],
            'heatmap-radius': {
              stops: [
                [1, 5],
                [10, 40]
              ]
            },
            'heatmap-opacity': {
              default: 1,
              stops: [
                [10, 1],
                [11, 0]
              ]
            },
          }}
        />

        {
          popUp && <Popup
            latitude={popUp.pos[1]}
            longitude={popUp.pos[0]}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setPopUp(null)}
            anchor="top" >
            <div>{popUp.description}</div>
          </Popup>
        }

        <div className="nav" style={navStyle}>
          <NavigationControl />
        </div>
      </MapGL>

    </div >
  )
};

export default Map;
