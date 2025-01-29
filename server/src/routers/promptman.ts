import { Router, Request, Response } from 'express';

const promptManRouter = Router();

promptManRouter.get('/', (req: Request, res: Response) => {
    res.send('Hello from PromptMan!');
  });

promptManRouter.post('/process-objective', (req:any, res:any) => {
    // Access the 'objective' from the request body
    const { objective } = req.body;
  
    // You should validate the 'objective' variable here
    if (typeof objective !== 'string') {
      // If 'objective' is not a string or not provided, send a 400 Bad Request response
      return res.status(400).json({ error: 'Objective must be a string' });
    }
  
    // Perform your logic with 'objective' here
    // ...
  
    // Respond with JSON
    res.json({ message: 'Received objective', objective: objective });
  });
  
export default promptManRouter;