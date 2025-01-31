import express, { Router, Request, Response } from 'express';
import Utils from '../common/utils';
import OpenAI from 'openai';
import { ProcessUserAnswersRequestBody } from '../models/PromptModels';

const promptManRouter = Router();

promptManRouter.post('/process-objective', async (req:any, res:any) => {
    // Access the 'objective' from the request body
    const { objective } = req.body;
  
    // You should validate the 'objective' variable here
    if (typeof objective !== 'string') {
      // If 'objective' is not a string or not provided, send a 400 Bad Request response
      return res.status(400).json({ error: 'Objective must be a string' });
    }
  
    // Respond with JSON
    // res.json({ message: 'Received objective', objective: objective });
  
    const prompt = generateInitialPrompt(objective);


    const client = new OpenAI({
      apiKey: Utils.get_openapi_api_key(), // This is the default and can be omitted
      dangerouslyAllowBrowser: true // We should move all interactions to a server
    });
  
    try {
      const response = await client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o',
       });
  
      let responseText = response.choices[0].message.content || "";
      // Clean up the response text to remove any extraneous formatting
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '');

      // res.set('Content-Type', 'application/json');
      res.json(responseText);  
    }
    catch (error) {

      console.error(error);
      res.json(error);
    }
  });

  
  promptManRouter.post('/process-user-answers', async (req: express.Request<{}, {}, ProcessUserAnswersRequestBody>, res:any) => {
    // Access the 'objective' from the request body
    
    try {
      console.log(`Your initial objective was ${req.body.userObjective}`);
      console.log(`First category is ${req.body.qa[0]}`);
    }
    catch (error) {
      console.error(error);
      res.json(error);
    }
  });

  const generateInitialPrompt = (objective:string): string => {
  const prompt = `
  ${objective}
  What information do you need from me to help you give me the helpful and detailed response to my question?
  Please format your response as json as a list of questions by category.  Use this format:
  {
    "category": "Category Name",
    "questions": [
      "Question 1",
      "Question 2",
      "Question 3"
    ]
  }`;
  
  return prompt;
}

export default promptManRouter;