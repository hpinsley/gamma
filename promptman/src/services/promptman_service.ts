import { ExecuteStepRequest, ExecuteStepResponse, CategoryQuestionsAndAnswers, ProcessUserAnswersRequestBody, Options } from '../models/PromptModels';
import { PROMPTMAN_SERVICE_URL } from '../config';

export const getServerQAndAFromUserObjectiveAsync = async (userObjective: string): Promise<ExecuteStepResponse> => {

    const body: ExecuteStepRequest = {
      userObjective: userObjective,
      stepToExecute: 0
    };

    const bodyString = JSON.stringify(body);

    const url = `${PROMPTMAN_SERVICE_URL}/promptman/process-step`;
    console.log(`url: ${url}`);

    const request = new Request(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyString,
    });

    const response = await fetch(request);
    const responseModel: ExecuteStepResponse = await response.json();
    return responseModel;
  };


  export const submitUserAnswersAsync = async (userObjective: string, categoryQuestionsAndAnswers: CategoryQuestionsAndAnswers[], options:Options, stepIndex:number): Promise<ExecuteStepResponse> => {
    const payload:ExecuteStepRequest = {
        userObjective: userObjective,
        stepToExecute: stepIndex,
        qa: categoryQuestionsAndAnswers,
        options: options
    }

    const bodyString = JSON.stringify(payload);

    const url = `${PROMPTMAN_SERVICE_URL}/promptman/process-step`;
    console.log(`url: ${url}`);

    const request = new Request(url, {
    method: "POST",
    headers: {
        'Content-Type': 'application/json',
    },
    body: bodyString,
    });

    const response = await fetch(request);
    const responseModel: ExecuteStepResponse = await response.json();
    return responseModel;
};