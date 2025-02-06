import { InitialPromptRequest, PromptResponse, CategoryQuestions, CategoryQuestionsAndAnswers, ProcessUserAnswersRequestBody, Options } from '../models/PromptModels';
import { PROMPTMAN_SERVICE_URL } from '../config';

export const getServerQAndAFromUserObjectiveAsync = async (userObjective: string): Promise<PromptResponse> => {

    const body: InitialPromptRequest = {
      objective: userObjective
    };

    const bodyString = JSON.stringify(body);

    const url = `${PROMPTMAN_SERVICE_URL}/promptman/process-objective`;
    console.log(`url: ${url}`);

    const request = new Request(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyString,
    });

    const response = await fetch(request);
    const responseModel: PromptResponse = await response.json();
    return responseModel;
  };


  export const submitUserAnswersToInitialQuestionsAsync = async (userObjective: string, categoryQuestionsAndAnswers: CategoryQuestionsAndAnswers[], options:Options): Promise<string> => {
    const payload:ProcessUserAnswersRequestBody = {
        userObjective: userObjective,
        qa: categoryQuestionsAndAnswers,
        options: options
    }

    const bodyString = JSON.stringify(payload);

    const url = `${PROMPTMAN_SERVICE_URL}/promptman/process-user-answers`;
    console.log(`url: ${url}`);

    const request = new Request(url, {
    method: "POST",
    headers: {
        'Content-Type': 'application/json',
    },
    body: bodyString,
    });

    const response = await fetch(request);
    const responseText = await response.text();
    return responseText;
};