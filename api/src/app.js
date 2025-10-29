import express from 'express'; // minimalist web framework. 
import cors from 'cors'; // allows your api to be accessed by web applications from different origins.
import helmet from 'helmet'; // helps secure your Express apps by setting various HTTP headers.
import pino from 'pino'; // fast logging library.
import pinoHttp from 'pino-http'; // HTTP logger middleware for Express using Pino.
import dotenv from 'dotenv'; // loads environment variables from a .env file into process.env.
import routes from './routes/index.js';

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(helmet());
app.use(cors()); // default: allow all origins.
app.use(express.json()); // parse incoming JSON requests.

// Set up Pino logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info', // Set log level from environment variable or default to 'info'
});
app.use(pinoHttp({ logger }));

app.use('/api', routes); // Mount routes at /api
app.use((err, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;