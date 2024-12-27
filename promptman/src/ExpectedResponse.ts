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