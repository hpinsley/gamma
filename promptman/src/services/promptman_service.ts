import { CategoryQuestions, CategoryQuestionsAndAnswers, ProcessUserAnswersRequestBody, Options } from '../models/PromptModels';

export const getServerQAndAFromUserObjectiveAsync = async (userObjective: string): Promise<CategoryQuestions[]> => {

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
    const categoriesAndQuestions: CategoryQuestions[] = JSON.parse(chatReply);

    return categoriesAndQuestions;
  };


  export const submitUserAnswersToInitialQuestionsAsync = async (userObjective: string, categoryQuestionsAndAnswers: CategoryQuestionsAndAnswers[], options:Options): Promise<string> => {
    const payload:ProcessUserAnswersRequestBody = {
        userObjective: userObjective,
        qa: categoryQuestionsAndAnswers,
        options: options
    }

    const bodyString = JSON.stringify(payload);

    const request = new Request("http://localhost:8080/promptman/process-user-answers", {
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