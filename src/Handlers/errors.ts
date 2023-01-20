// Mango Bot - multifunctional Discord application service.
// Copyright (C) 2023  YEAR Development

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

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
