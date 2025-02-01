import React from 'react';
import OpenAI from 'openai';
import ReactMarkdown from 'react-markdown';

import { CategoryQuestions, CategoryQuestionsAndAnswers, QuestionAndAnswer, Options, ProcessUserAnswersRequestBody } from './models/PromptModels';

interface PromptManProps {
  onDetailPlanGenerated?: (question: string, detailedPlan: string) => any;
}

enum PromptState {
  NeedInitialQuestion,
  FetchingInitialResponse,
  NeedUserAnswers,
  FetchingSecondaryResponse,
  DisplayingFinalResults
}

enum FetchState {
  NotStarted,
  Loading,
  Loaded,
  Error
};

const PromptMan: React.FC<PromptManProps> = ({ onDetailPlanGenerated }) => {
  // const [initialQuestion, setinitialQuestion] = React.useState('How can I be my best self?');
  const [userObjective, setUserObjective] = React.useState('How can I become a full stack developer?');
  const [categoryQuestionsAndAnswers, setCategoryQuestionsAndAnswers] = React.useState<CategoryQuestionsAndAnswers[]>([]);
  const [secondSubmissionPrompt, setSecondSubmissionPrompt] = React.useState('PROMPT');
  const [detailedPlan, setDetailedPlan] = React.useState('');
  const [fetchState, setFetchState] = React.useState<FetchState>(FetchState.NotStarted);
  const [promptState, setPromptState] = React.useState<PromptState>(PromptState.NeedInitialQuestion);
  const [errorMsg, setErrorMsg] = React.useState('');

  const client = new OpenAI({
    apiKey: process.env['REACT_APP_OPENAI_API_KEY'], // This is the default and can be omitted
    dangerouslyAllowBrowser: true // We should move all interactions to a server
  });

  const processUserObjective = async () => {

    setCategoryQuestionsAndAnswers([]);
    setPromptState(PromptState.FetchingInitialResponse);
    setFetchState(FetchState.Loading);
    setErrorMsg('');

    try {
      await getServerQAndAFromUserObjective(userObjective);
      setFetchState(FetchState.Loaded);
      setPromptState(PromptState.NeedUserAnswers);
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

  const currentAnswerCount = (): number => {
    return categoryQuestionsAndAnswers.reduce((acc, category) => {
      return acc + category.questionsAndAnswers.reduce((acc, qa) => {
        return acc + (qa.answer === '' ? 0 : 1);
      }, 0)
    }, 0);
  }

  const displayCurrentAnswers = () => {
    if (promptState !== PromptState.NeedUserAnswers && promptState !== PromptState.FetchingSecondaryResponse) {
      return null;
    }

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
        <div>
          <div>
            {currentAnswerCount() > 0 && promptState !== PromptState.FetchingSecondaryResponse && (<button id="submit-answers" onClick={submitUserAnswersToInitialQuestions}>Submit Answers</button>)}
          </div>
        </div>
      </div>);
  };

  const displayCategoryQuestions = () => {
    if (categoryQuestionsAndAnswers.length === 0) {
      return null;
    }

    return (
      <div>
        <div>Please answer the following additional questions so that we can come up with a detailed plan for <h2>{userObjective}</h2></div>
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

  const getServerQAndAFromUserObjective = async (userObjective: string) => {

    const body = {
      objective: userObjective
    };

    const bodyString = JSON.stringify(body);

    const request = new Request("http://localhost:8080/promptman/process-objective", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyString,
    });

    const response = await fetch(request);
    const chatReply = await response.json();
    const responseData: CategoryQuestions[] = JSON.parse(chatReply);

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
    setDetailedPlan(responseText);
    if (onDetailPlanGenerated) {
      onDetailPlanGenerated(userObjective, responseText);
    }
  }

  const submitUserAnswersToInitialQuestions = async (): Promise<void> => {
    try {

      setPromptState(PromptState.FetchingSecondaryResponse);

      const qa: CategoryQuestionsAndAnswers[] = categoryQuestionsAndAnswers;
  
      const payload:ProcessUserAnswersRequestBody = {
        userObjective: userObjective,
        qa: qa,
        options: {
          removeEmptyQuestions: true
        }
      }
      console.log('This is what I would send to the server');
      const bodyString = JSON.stringify(payload);
      console.log(bodyString);

      const request = new Request("http://localhost:8080/promptman/process-user-answers", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: bodyString,
      });

      const response = await fetch(request);
      const chatReply = await response.text();
      console.log(chatReply);

      // const prompt = `I originally asked you ${userObjective}\n
      // You asked me some follow-up questions that you felt you needed to provide me with a detailed plan. The entire goal of this is to create the "perfect chatgpt prompt" for the user to copy and paste into chatgpt so they get the best and most helpful response based on their initial objective. 
      // Here are questions you asked me and the answers I provided in json format:
      // \n
      // ${qaJson}
      // \n
      // With all this information, I'd like you to construct the perfect PROMPT for the user to copy and paste into gpt. Be sure to include somewhere in the prompt, "go back and forth with me until we have generated a response that helps me achieve my goal"
      // `;

      // setSecondSubmissionPrompt(prompt);
      // setFetchState(FetchState.Loading);
      // setErrorMsg('');

      // await getSecondaryChatResponse(prompt);
      // setFetchState(FetchState.Loaded);
      // setPromptState(PromptState.DisplayingFinalResults);
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

  const restart = () => {
    setUserObjective('');
    setCategoryQuestionsAndAnswers([]);
    setDetailedPlan('');
    setFetchState(FetchState.NotStarted);
    setPromptState(PromptState.NeedInitialQuestion);
    setErrorMsg('');
  }

  const displayDetailedPlan = () => {
    if (promptState !== PromptState.DisplayingFinalResults) {
      return null;
    }

    return (
      <div id='detailed-plan'>
        <h3>Detailed Plan</h3>
        <div id='markdown'>
          <ReactMarkdown>{detailedPlan}</ReactMarkdown>
        </div>
        <button id="restart" onClick={restart}>Ask New Question</button>
      </div>
    );
  };

  const renderQuestionInput = () => {

    if (promptState !== PromptState.NeedInitialQuestion) {
      return null;
    }

    return (

      <div>
        <hr />
        <div id="question">
          <label>Enter your goal or objective:</label>
          <input
            value={userObjective}
            onChange={(e) => setUserObjective(e.target.value)} />
          <button id="ask" onClick={processUserObjective}>Ask</button>
        </div>
      </div>
    );
  };

  const getFetchStateMessage = (fetchState: FetchState): string => {
    switch (fetchState) {
      case FetchState.NotStarted:
        return 'Not Started';
      case FetchState.Loading:
        return 'Loading...';
      case FetchState.Loaded:
        return 'Loaded';
      case FetchState.Error:
        return 'Error';
      default:
        return 'Unknown State';
    }
  };

  const renderStatusBar = () => {
    return (
      <div id="status-bar">
        {fetchState === FetchState.Loading && getFetchStateMessage(fetchState)}
        {errorMsg}
      </div>
    )
  };

  const renderQuestionsAndAnswers = () => {
    if (promptState === PromptState.NeedInitialQuestion ||
      promptState === PromptState.FetchingInitialResponse ||
      promptState === PromptState.DisplayingFinalResults) {
      return null;
    }

    return (
      <div id='questions-answers'>
        <div id='questions'>
          {displayCategoryQuestions()}
        </div>
        <div id='answers'>
          {displayCurrentAnswers()}
        </div>
      </div>
    );
  }

  return (
    <div>
      {renderQuestionInput()}
      {renderQuestionsAndAnswers()}
      {displayDetailedPlan()}
      {renderStatusBar()}
    </div>
  );
};

export default PromptMan;