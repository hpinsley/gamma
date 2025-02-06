import { WorkflowStage } from "./WorkflowModels";

export interface CategoryQuestions {
    category: string;
    questions: string[];
}

export interface QuestionAndAnswer {
    question: string;
    answer: string;
}

export interface CategoryQuestionsAndAnswers {
    category: string;
    questionsAndAnswers: QuestionAndAnswer[];
}

export interface Options {
    removeEmptyQuestions: true
}

export interface ProcessUserAnswersRequestBody {
    userObjective: string; // or the appropriate type
    qa: CategoryQuestionsAndAnswers[];
    options?: Options;
}

export interface InitialPromptRequest {
    objective: string;
}

export interface PromptResponse {
    userObjective: string;
    nextStage: WorkflowStage;
    nextStepIndex: number;
    categoryQuesions: CategoryQuestions[]     
}