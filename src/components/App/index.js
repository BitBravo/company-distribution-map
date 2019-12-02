import React from 'react';
import Map from '../Map';
import pins from '../../data/pins.json'

function App() {
  return <Map pins={pins} />;
}

export default App;
