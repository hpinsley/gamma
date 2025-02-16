import React from 'react';
import ReactMarkdown from 'react-markdown';

import { CategoryQuestionsAndAnswers, QuestionAndAnswer, Options } from '../../models/PromptModels';
import { executeStepAsync} from '../../services/promptman_service';
import { WorkflowStage } from '../../models/WorkflowModels';
import { mapCategoryQuestions } from '../../common/utils';

interface PromptManProps {
  onDetailPlanGenerated?: (question: string, detailedPlan: string) => any;
}

enum PromptState {
  NeedInitialQuestion,
  NeedUserAnswers,
  FetchingResponse,
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
  const [userObjective, setUserObjective] = React.useState('How can I become an interior designer?');
  const [workflowStage, setWorkflowStage] = React.useState<WorkflowStage>(WorkflowStage.INITIAL);
  const [nextStepIndex, setNextStepIndex] = React.useState<number>(0);
  const [categoryQuestionsAndAnswers, setCategoryQuestionsAndAnswers] = React.useState<CategoryQuestionsAndAnswers[]>([]);
  const [priorCategoryQuestionsAndAnswers, setPriorCategoryQuestionsAndAnswers] = React.useState<CategoryQuestionsAndAnswers[]>([]);
  const [detailedPlan, setDetailedPlan] = React.useState('');
  const [fetchState, setFetchState] = React.useState<FetchState>(FetchState.NotStarted);
  const [promptState, setPromptState] = React.useState<PromptState>(PromptState.NeedInitialQuestion);
  const [errorMsg, setErrorMsg] = React.useState('');

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
    if (promptState !== PromptState.NeedUserAnswers && promptState !== PromptState.FetchingResponse) {
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
            {currentAnswerCount() > 0 && promptState !== PromptState.FetchingResponse && (<button id="submit-answers" onClick={sendStateToServer}>Submit Answers</button>)}
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

  const sendStateToServer = async (): Promise<void> => {
    try {

      setPromptState(PromptState.FetchingResponse);
      setFetchState(FetchState.Loading);
      setErrorMsg('');

      const options:Options = {
        removeEmptyQuestions: true
      }
  
      if (nextStepIndex === undefined) {
        throw new Error('Next step index is undefined');
      }

      const response = await executeStepAsync(userObjective, categoryQuestionsAndAnswers, priorCategoryQuestionsAndAnswers, options, nextStepIndex);
      setFetchState(FetchState.Loaded);
      setWorkflowStage(response.stage);
      setNextStepIndex(response.nextStepIndex);

      if (response.stage === WorkflowStage.FINAL_PROMPT_GENERATED) {
        if (!response.finalPrompt) {
          console.error("Final stage reached but no prompt was generated.")
        }
        else {
          setDetailedPlan(response.finalPrompt);
          setPromptState(PromptState.DisplayingFinalResults);
          if (onDetailPlanGenerated) {
            onDetailPlanGenerated(userObjective, response.finalPrompt);
          }
        }
      }
      else {
      // Convert the response data to the format we need to include our answers
      if (!response.categoryQuesions) {
        throw new Error('No questions returned from server');
      }
        const qa: CategoryQuestionsAndAnswers[] = response.categoryQuesions.map(mapCategoryQuestions);
        mergeCurrentQandAIntoPrior();
        setPriorCategoryQuestionsAndAnswers([...categoryQuestionsAndAnswers]);
        setCategoryQuestionsAndAnswers(qa);
        setPromptState(PromptState.NeedUserAnswers);
      }
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

  const mergeCurrentQandAIntoPrior = () => {
    const currentQandA = categoryQuestionsAndAnswers;
    const priorQandA = priorCategoryQuestionsAndAnswers;
  
    const mergedQandA = [...priorQandA];
  
    currentQandA.forEach(currentCategory => {
      const priorCategory = mergedQandA.find(category => category.category === currentCategory.category);
  
      if (priorCategory) {
        currentCategory.questionsAndAnswers.forEach(currentQA => {
          const priorQA = priorCategory.questionsAndAnswers.find(qa => qa.question === currentQA.question);
  
          if (priorQA) {
            priorQA.answer = currentQA.answer;
          } else {
            priorCategory.questionsAndAnswers.push(currentQA);
          }
        });
      } else {
        mergedQandA.push(currentCategory);
      }
    });
  
    setPriorCategoryQuestionsAndAnswers(mergedQandA);
  }

  const restart = () => {
    setUserObjective('');
    setCategoryQuestionsAndAnswers([]);
    setPriorCategoryQuestionsAndAnswers([]);
    setDetailedPlan('');
    setWorkflowStage(WorkflowStage.INITIAL);
    setNextStepIndex(0)
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
          <button id="ask" onClick={sendStateToServer}>Ask</button>
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

  const renderCurrentServerState = () => {
    return (
      <div>
        <div>
          Stage: {workflowStage}
        </div>
        <div>
          Next Step: {nextStepIndex}
        </div>
      </div>
  );
  }

  const renderQuestionsAndAnswers = () => {
    if (promptState === PromptState.NeedInitialQuestion ||
      promptState === PromptState.FetchingResponse ||
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
      {renderCurrentServerState()}
      {renderQuestionsAndAnswers()}
      {displayDetailedPlan()}
      {renderStatusBar()}
    </div>
  );
};

export default PromptMan;