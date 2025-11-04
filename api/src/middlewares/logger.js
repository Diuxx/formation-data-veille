import pino from 'pino'
import pinoHttp from 'pino-http'
import pkg from 'pino-multi-stream';
import * as rfs from 'rotating-file-stream';

const { multistream } = pkg;
const logDir = process.env.LOG_DIR || './logs';
const isDev = process.env.NODE_ENV === 'development';

const rotatingStream = rfs.createStream('app.log', {
  size: '10M',     // rotation dès 10 Mo
  interval: '1d',  // rotation quotidienne
  compress: 'gzip',
  path: logDir,
});

const prettyStream = isDev
  ? pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    }).stream()
  : process.stdout;

const streams = [
  { stream: prettyStream }, // console
  { stream: rotatingStream }, // fichier rotatif
];

const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    formatters: { level: (label) => ({ level: label }) },
  },
  multistream(streams)
);

export const httpLogger = pinoHttp({
    logger,
    serializers: {
        req: (req) => ({
            method: req.method, url: req.url
        }),
        res: (res) => ({
            statusCode: res.statusCode
        })
    },
    customLogLevel: (res, err) => {
        if (err instanceof Error) return 'error';
        if (res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
    },
    customSuccessMessage: (_req, res, responseTime) => {
        return `${res.statusCode} ${res.statusMessage} (${responseTime}ms)`;
    },
    customErrorMessage: (error, res) => {
        const msg = error?.message || 'Internal Server Error';
        return `${res.statusCode || 500} - ${msg}`.trim();
    }
})

export default logger;