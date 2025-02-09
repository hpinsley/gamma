import { CategoryQuestions, CategoryQuestionsAndAnswers } from '../models/PromptModels';

export function mapCategoryQuestions(categoryQuestions: CategoryQuestions) : CategoryQuestionsAndAnswers {
    return {
        category: categoryQuestions.category,
        questionsAndAnswers: categoryQuestions.questions.map((question) => {
            return {
                question: question,
                answer: ''
            };
        })
    };
}
