import React from 'react';
import OpenAI from 'openai';
import { CategoryQuestions, CategoryQuestionsAndAnswers, QuestionAndAnswer } from './ExpectedResponse';

interface PromptManProps {
  name: string;
}

const PromptMan: React.FC<PromptManProps> = ({ name }) => {
  // const [initialQuestion, setinitialQuestion] = React.useState('How can I be my best self?');
  const [initialQuestion, setinitialQuestion] = React.useState('How can I become a full stack developer?');
  const [message, setMessage] = React.useState('');
  const [categoryQuestionsAndAnswers, setCategoryQuestionsAndAnswers] = React.useState<CategoryQuestionsAndAnswers[]>([]);

  const client = new OpenAI({
    apiKey: process.env['REACT_APP_OPENAI_API_KEY'], // This is the default and can be omitted
    dangerouslyAllowBrowser: true // We should move all interactions to a server
  });

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
    
    Do not include any additional language other than the json format.  I will provide the answers to the questions in the next step.`;

    setCategoryQuestionsAndAnswers([]);
    setMessage('Waiting...');
    try {
      await getChatGPTResponse(prompt);
      setMessage('');
    }
    catch (error) {
      console.error(error);
      setMessage(`An error occurred (${error}).  Please try again.`);
    }
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

  const displayCurrentAnswers = () => {
    if (categoryQuestionsAndAnswers.length === 0) {
      return null;
    }

    return (
      <div>
        <h3>Current Answers:</h3>
        <hr />
        <ul>
          {categoryQuestionsAndAnswers.map((category, index) => (
            category.questionsAndAnswers.map((qa, qaIndex) => {
              if (qa.answer === '') {
                return null;
              }
              return (
                <li key={qaIndex}>
                  <div>{qa.question}</div>
                  <div className="answer">{qa.answer}</div>
                </li>
              );
            })
          ))}
        </ul>
      </div>);
  };

  const displayCategoryQuestions = () => {
    if (categoryQuestionsAndAnswers.length === 0) {
      return null;
    }

    return (
      <div>
        {categoryQuestionsAndAnswers.map((category, index) => (
          <div key={index}>
            <h3>{category.category}</h3>
            <ul>
              {category.questionsAndAnswers.map((qa, qaIndex) => (
                <li key={qaIndex}>
                  <div>{qa.question}</div>
                  <div>
                    <input
                      type='text'
                      onChange={ev => setAnswer(qa, ev.target.value)}
                      value={qa.answer} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  const getChatGPTResponse = async (prompt: string) => {

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

      <hr />
      <div id="question">
        <label>Enter your question:</label>
        <input
          value={initialQuestion}
          onChange={(e) => setinitialQuestion(e.target.value)} />
        <button id="ask" onClick={generateInitialPrompt}>Ask</button>
      </div>
      <hr />

      <div id="message">{message}</div>
      <div id='questions-answers'>
        <div id='questions'>
          {displayCategoryQuestions()}
        </div>
        <div id='answers'>
          {displayCurrentAnswers()}
          <div>
            <button>Submit Answers</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptMan;