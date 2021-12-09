import path from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file';

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join('logs', '%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
});

const logger = winston.createLogger({
  transports: [fileRotateTransport],
});

export default logger;
