import { client } from '..';

export function error(): void {
  client.on('error', (error) => {
    console.error('[Error Handling System] Discord Error');
    console.error(error);
  });

  process.on('unhandledRejection', (reason, p) => {
    console.error('[Error Handling System] Unhandled Rejection/Catch');
    console.error(reason, p);
  });

  process.on('uncaughtException', (err, origin) => {
    console.error('[Error Handling System] Uncaught Exception/Catch');
    console.error(err, origin);
  });

  process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.error('[Error Handling System] Uncaught Exception/Catch (Monitor)');
    console.error(err, origin);
  });

  process.on('warning', (warning) => {
    console.error('[Error Handling System] Warning');
    console.error(warning);
  });
}
