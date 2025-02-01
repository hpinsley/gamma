import { CategoryQuestions, CategoryQuestionsAndAnswers, QuestionAndAnswer, ProcessUserAnswersRequestBody } from '../models/PromptModels';

export const getServerQAndAFromUserObjectiveAsync = async (userObjective: string) => {

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
    return chatReply;
  };

