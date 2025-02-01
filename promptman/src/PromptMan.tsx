import React from 'react';
import ReactMarkdown from 'react-markdown';

import { CategoryQuestions, CategoryQuestionsAndAnswers, QuestionAndAnswer, ProcessUserAnswersRequestBody, Options } from './models/PromptModels';
import {getServerQAndAFromUserObjectiveAsync, submitUserAnswersToInitialQuestionsAsync} from './services/promptman_service';

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
  const [detailedPlan, setDetailedPlan] = React.useState('');
  const [fetchState, setFetchState] = React.useState<FetchState>(FetchState.NotStarted);
  const [promptState, setPromptState] = React.useState<PromptState>(PromptState.NeedInitialQuestion);
  const [errorMsg, setErrorMsg] = React.useState('');

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

    const responseData:CategoryQuestions[] = await getServerQAndAFromUserObjectiveAsync(userObjective);

    console.log(responseData);

    // Convert the response data to the format we need to include our answers
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

  const submitUserAnswersToInitialQuestions = async (): Promise<void> => {
    try {

      setPromptState(PromptState.FetchingSecondaryResponse);
      setFetchState(FetchState.Loading);
      setErrorMsg('');

      const options:Options = {
        removeEmptyQuestions: true
      }
  
      const finalPrompt = await submitUserAnswersToInitialQuestionsAsync(userObjective, categoryQuestionsAndAnswers, options);

      setDetailedPlan(finalPrompt);
      if (onDetailPlanGenerated) {
        onDetailPlanGenerated(userObjective, finalPrompt);
      }
        setFetchState(FetchState.Loaded);
      setPromptState(PromptState.DisplayingFinalResults);
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