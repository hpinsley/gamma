import React from 'react';

interface ServerTestProps {
}

const ServerTest: React.FC<ServerTestProps> = (props) => {
  const contactServer = async () => {
    try {
      console.log("Attempting fetch");

      // const response = await fetch("http://host.docker.internal:8080");
      const response = await fetch("http://localhost:8080");
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const text = await response.text()
      console.log(text);

    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  return (
    <div>
      <button onClick={() => contactServer()}>Contact Server</button>
    </div>);
};

export default ServerTest;