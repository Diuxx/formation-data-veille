import express from 'express'; // minimalist web framework. 
import cors from 'cors'; // allows your api to be accessed by web applications from different origins.
import helmet from 'helmet'; // helps secure your Express apps by setting various HTTP headers.
import { httpLogger } from './middlewares/logger.js';

import dotenv from 'dotenv'; // loads environment variables from a .env file into process.env.
import routes from './routes/index.js';

import { initializeDatabase } from './database/prisma-init.js';

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(httpLogger); // Set up Pino logger

app.use(helmet());
app.use(cors()); // default: allow all origins.

app.use(express.json()); // parse incoming JSON requests.
app.disable('etag'); // disable caching ressource automatically.

/**
 * Auto-initialize the database when enabled. For MariaDB/MySQL, this will
 * create the DB if needed and run the schema script; for other setups,
 * `initializeDatabase` can be adapted accordingly.
 */
if (process.env.AUTO_INIT_DB === 'true') {
  initializeDatabase()
    .catch((err) => console.error('Database initialization failed:', err));
}

// Mount routes at /api
app.use('/api', routes); 
app.use((err, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;