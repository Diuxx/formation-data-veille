import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

const shutdown = () => {
  console.log('Stopping server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
};

// signals
process.on('SIGINT', shutdown); // Ctrl + C.
process.on('SIGTERM', shutdown); // kill or Docker stop.