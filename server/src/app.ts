import express, { Request, Response } from 'express';
import cors from 'cors';
import promptManRouter from './routers/promptman'; // Adjust the path as necessary

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json()); // This line is crucial

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from gamma...');
});

app.use('/promptman', promptManRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});