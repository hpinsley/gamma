import React from 'react';

interface PromptManProps {
  name: string;
}

const PromptMan: React.FC<PromptManProps> = ({ name }) => {

  const [currentProfession, setCurrentProfession] = React.useState('Data Analyst');
  const [desiredProfession, setDesiredProfession] = React.useState('Software Engineer');
  const [prompt, setPrompt] = React.useState('');

  const generateInitialPrompt = () => {
    const prompt = `
    You are a ${currentProfession} 
    who wants to become a ${desiredProfession}.`;
    setPrompt(prompt);
  };

  return (
    <div>
      <div>
        <label>Enter your current profession:</label>
        <input
          value={currentProfession}
          onChange={(e) => setCurrentProfession(e.target.value)} />
      </div>
      <div>
        <label>Enter your desired profession:</label>
        <input
          value={desiredProfession}
          onChange={(e) => setDesiredProfession(e.target.value)} />
      </div>
      <div>
        <button onClick={generateInitialPrompt}>Generate Prompt</button>
      </div>
      <div>
        {prompt}
      </div>
    </div>
  );
};

export default PromptMan;
