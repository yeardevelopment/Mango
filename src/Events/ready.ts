import Discord from 'discord.js';
import mongoose from 'mongoose';
import chalk from 'chalk';
import 'dotenv/config';
import { Event } from '../structures/Event';

export default new Event('ready', async (client) => {
  console.log(
    `The bot is ready to work.\nLogged in as ${client.user.tag}\nAPI Latency: ${client.ws.ping} ms\n`
  );
  const arrayOfStatuses = [
    `Release 🎉`,
    `${client.users.cache.size} users`,
    `${client.guilds.cache.size} servers`,
  ];
  let index = 0;
  setInterval(() => {
    if (index === arrayOfStatuses.length) index = 0;
    const status1 = arrayOfStatuses[index];
    client.user.setPresence({
      activities: [{ name: status1, type: 'WATCHING' }],
      status: 'online',
    });
    index++;
  }, 10000);
  if (!process.env.MONGO_URI) return;
  await mongoose
    .connect(process.env.MONGO_URI || '', {
      keepAlive: true,
    })
    .then(() => {
      console.log(
        chalk.bold.green('✔ Successfully connected to the database.')
      );
    })
    .catch((error) => console.error(error));
});
