import React from 'react';
import OpenAI from 'openai';

interface PromptManProps {
  name: string;
}

const PromptMan: React.FC<PromptManProps> = ({ name }) => {
  const [currentProfession, setCurrentProfession] = React.useState('Data Analyst');
  const [desiredProfession, setDesiredProfession] = React.useState('Software Engineer');
  const [prompt, setPrompt] = React.useState('');
  const [response, setResponse] = React.useState('');

  const generateInitialPrompt = async () => {
    const prompt = `
    I am currently a ${currentProfession}. I want to become a ${desiredProfession}.
    Which questions should I ask you to help me achieve my goal?
    Please list the specific questions you'd like me to answer and respond in json.`;

    setPrompt(prompt);
    await getChatGPTResponse(prompt);
  };

  const getChatGPTResponse = async (prompt: string) => {
    console.log(process.env);
    const client = new OpenAI({
      apiKey: process.env['REACT_APP_OPENAI_API_KEY'], // This is the default and can be omitted
      dangerouslyAllowBrowser: true // We should move all interactions to a server
    });

    const response = await client.chat.completions.create({
      messages: [{ role: 'user', content: 'Say this is a test' }],
      model: 'gpt-4o',
    });
    console.log(response);
    setResponse(JSON.stringify(response));
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
      <button onClick={generateInitialPrompt}>Generate Prompt</button>
      <div>
        <h3>Generated Prompt:</h3>
        <pre>{prompt}</pre>
      </div>
      <div>
        <h3>ChatGPT Response:</h3>
        <pre>{response}</pre>
      </div>
    </div>
  );
};

export default PromptMan;