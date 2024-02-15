// Mango Bot - multifunctional Discord application service.
// Copyright (C) 2024  YEAR Development

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

import { ActivityType } from 'discord.js';
import mongoose from 'mongoose';
import chalk from 'chalk';
import 'dotenv/config';
import { Event } from '../structures/Event';
import DB from '../utils/models/clientStatus';

async function getMemoryUsage(): Promise<number> {
  return process.memoryUsage().heapUsed / Number((1024 * 1024).toFixed(2));
}

export default new Event('ready', async (client) => {
  console.log(
    `The bot is ready to work.\nLogged in as ${client.user.tag}\nAPI Latency: ${client.ws.ping} ms\n`
  );
  const arrayOfStatuses = [
    `Finally Up! 🎉`,
    `${client.guilds.cache.size} servers`,
    'Report System',
    'Verification System',
    'Ticket System',
  ];
  let index = 0;
  setInterval(() => {
    if (index === arrayOfStatuses.length) index = 0;
    const status = arrayOfStatuses[index];
    client.user.setPresence({
      activities: [{ name: status, type: ActivityType.Watching }],
      status: 'online',
    });
    index++;
  }, 10000);

  if (!process.env.MONGO_URI) return;
  await mongoose
    .connect(process.env.MONGO_URI || '')
    .then(() => {
      console.log(
        chalk.bold.green('✔ Successfully connected to the database.')
      );
    })
    .catch((error) => console.error(error));

  let memArray = [];

  setInterval(async () => {
    memArray.push(await getMemoryUsage());

    if (memArray.length >= 14) memArray.shift();

    await DB.findOneAndUpdate(
      {
        Client: true,
      },
      {
        Memory: memArray,
      },
      {
        upsert: true,
      }
    );
  }, 10000);
});
