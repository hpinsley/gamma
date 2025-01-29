import React from 'react';

interface ServerTestProps {
}

const ServerTest: React.FC<ServerTestProps> = (props) => {
    const contactServer = () => {
      console.log("Contacting server");
    }

    return (
      <div>
        <button onClick={() => contactServer()}>Contact Server</button>
      </div>);
  };

export default ServerTest;