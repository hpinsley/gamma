import React from 'react';
import { Configuration, OpenAIApi } from 'openai';

const PromptMan: React.FC<PromptManProps> = ({ name }) => {
  const [currentProfession, setCurrentProfession] = React.useState('Data Analyst');
  const [desiredProfession, setDesiredProfession] = React.useState('Software Engineer');
  const [prompt, setPrompt] = React.useState('');
  const [response, setResponse] = React.useState('');

  const generateInitialPrompt = () => {
    const prompt = `
    I am currently a ${currentProfession}. I want to become a ${desiredProfession}.
    Which questions should I ask you to help me achieve my goal?
    Please list the specific questions you'd like me to answer and respond in json.`;
    
    setPrompt(prompt);
    getChatGPTResponse(prompt);
  };

  const getChatGPTResponse = async (prompt: string) => {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    try {
      const completion = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 150,
      });
      setResponse(completion.data.choices[0].text);
    } catch (error) {
      console.error('Error fetching response from OpenAI:', error);
    }
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