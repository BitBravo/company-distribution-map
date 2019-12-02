import React, { useState } from 'react';

const Home = () => {
  const [ animationDuration, setAnimationDuration] = useState(4);

  function handleSetAnimationDuration(e) {
    setAnimationDuration(parseFloat(e.target.value));
  }

  return (
    <div>
      <h1>
      </h1>
    
      <div>
       
      </div>
    </div>
  );
};

export default Home;
