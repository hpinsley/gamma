import React from 'react';
import OpenAI from 'openai';
import { CategoryQuestions, CategoryQuestionsAndAnswers, QuestionAndAnswer } from './ExpectedResponse';

interface PromptManProps {
  name: string;
}

const PromptMan: React.FC<PromptManProps> = ({ name }) => {
  const [initialQuestion, setinitialQuestion] = React.useState('How can I be my best self?');
  const [prompt, setPrompt] = React.useState('');
  const [response, setResponse] = React.useState('');
  const [categoryQuestionsAndAnswers, setCategoryQuestionsAndAnswers] = React.useState<CategoryQuestionsAndAnswers[]>([]);

  const generateInitialPrompt = async () => {
    const prompt = `
    ${initialQuestion}
    What information do you need from me to help you give me the helpful and detailed response to my question?
    Please format your response as json as a list of questions by category.  Use this format:
    {
      "category": "Category Name",
      "questions": [
        "Question 1",
        "Question 2",
        "Question 3"
      ]
    };
    `;

    setPrompt(prompt);
    setResponse('Waiting...');
    setCategoryQuestionsAndAnswers([]);

    await getChatGPTResponse(prompt);
  };

  const setAnswer = (qa: QuestionAndAnswer, answer: string) => {
    const newCategoryQuestionsAndAnswers = categoryQuestionsAndAnswers.map((category) => {
      return {
        category: category.category,
        questionsAndAnswers: category.questionsAndAnswers.map((questionAndAnswer) => {
          if (questionAndAnswer === qa) {
            return {
              question: questionAndAnswer.question,
              answer: answer
            };
          }
          return questionAndAnswer;
        })
      };
    });

    setCategoryQuestionsAndAnswers(newCategoryQuestionsAndAnswers);
  }

  const displayCategoryQuestions = () => {
    return categoryQuestionsAndAnswers.map((category, index) =>
      <div>
        <h3>{category.category}</h3>
        <ul>
          {category.questionsAndAnswers.map((qa, index) => (
            <li key={index}>
              <div>{qa.question}</div>
              <div><input type='text' onChange={ev => setAnswer(qa, ev.target.value)} value={qa.answer}></input></div>
            </li>
          ))}
        </ul>
      </div>);
  }

  const getChatGPTResponse = async (prompt: string) => {
    console.log(process.env);
    const client = new OpenAI({
      apiKey: process.env['REACT_APP_OPENAI_API_KEY'], // This is the default and can be omitted
      dangerouslyAllowBrowser: true // We should move all interactions to a server
    });

    const response = await client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o',
    });
    console.log(response);
    let responseText = response.choices[0].message.content || "";
    // Clean up the response text to remove any extraneous formatting
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '');
    let responseData: CategoryQuestions[] = JSON.parse(responseText);
    console.log(responseData);
    setResponse("Received response");

    const qa: CategoryQuestionsAndAnswers[] = responseData.map((category: CategoryQuestions) => {
      return {
        category: category.category,
        questionsAndAnswers: category.questions.map((question: string) => {
          return {
            question: question,
            answer: ''
          };
        })
      };
    });

    setCategoryQuestionsAndAnswers(qa);
  };

  return (
    <div>
      <div>
        <label>Enter your question:</label>
        <input
          value={initialQuestion}
          onChange={(e) => setinitialQuestion(e.target.value)} />
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
      <div>
        {displayCategoryQuestions()}
      </div>
    </div>
  );
};

export default PromptMan;