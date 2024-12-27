import React from 'react';
import OpenAI from 'openai';
import { CategoryQuestions, CategoryQuestionsAndAnswers, QuestionAndAnswer } from './ExpectedResponse';

interface PromptManProps {
  name: string;
}

enum FetchState {
  NotStarted,
  Loading,
  Loaded,
  Error
};

const PromptMan: React.FC<PromptManProps> = ({ name }) => {
  // const [initialQuestion, setinitialQuestion] = React.useState('How can I be my best self?');
  const [initialQuestion, setinitialQuestion] = React.useState('How can I become a full stack developer?');
  const [categoryQuestionsAndAnswers, setCategoryQuestionsAndAnswers] = React.useState<CategoryQuestionsAndAnswers[]>([]);
  const [secondSubmissionPrompt, setSecondSubmissionPrompt] = React.useState('PROMPT');
  const [detailedPlan, setDetailedPlan] = React.useState('');
  const [fetchState, setFetchState] = React.useState<FetchState>(FetchState.NotStarted);
  const [errorMsg, setErrorMsg] = React.useState('');

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
    setFetchState(FetchState.Loading);
    setErrorMsg('');

    try {
      await getInitialChatResponse(prompt);
      setFetchState(FetchState.Loaded);
    }
    catch (error) {
      console.error(error);
      setFetchState(FetchState.Error);
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('An unknown error occurred');
      }
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
        <h3>{currentAnswerCount()} Current Answers</h3>
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

  const getInitialChatResponse = async (prompt: string) => {

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

  const getSecondaryChatResponse = async (prompt: string) => {
    const response = await client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o',
    });
    console.log(response);
    let responseText = response.choices[0].message.content || "";
    setDetailedPlan(responseText)
  }

  const generateSecondPromptAndSend = async (): Promise<void> => {
    const qa: CategoryQuestionsAndAnswers[] = categoryQuestionsAndAnswers;
    const qaJson = JSON.stringify(qa);
    const prompt = `I originally asked you ${initialQuestion}\n
    You asked me some follow-up questions that you felt you needed to provide me with a detailed plan.
    Here are questions you asked me and the answers I provided in json format:
    \n
    ${qaJson}
    \n
    Please construct a detailed plan to achieve this goal.
    `;

    setSecondSubmissionPrompt(prompt);
    setFetchState(FetchState.Loading);
    setErrorMsg('');

    try {
      await getSecondaryChatResponse(prompt);
      setFetchState(FetchState.Loaded);
    }
    catch (error) {
      console.error(error);
      setFetchState(FetchState.Error);
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('An unknown error occurred');
      }
    }
  }

  const currentAnswerCount = (): number => {
    return categoryQuestionsAndAnswers.reduce((acc, category) => {
      return acc + category.questionsAndAnswers.reduce((acc, qa) => {
        return acc + (qa.answer === '' ? 0 : 1);
      }, 0)
    }, 0);
  }

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

      <div id="message">{fetchState} - {errorMsg}</div>
      <div id='questions-answers'>
        <div id='questions'>
          {displayCategoryQuestions()}
        </div>
        <div id='answers'>
          {displayCurrentAnswers()}
          <div>
            {currentAnswerCount() > 0 && (<button id="submit-answers" onClick={generateSecondPromptAndSend}>Submit Answers</button>)}
            <hr />
            <div>
              <h3>Detailed Plan</h3>
              <textarea content={detailedPlan} />
              <div>
                <div>DIV DISPLAY</div>
                <div>{detailedPlan}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptMan;