import Discord from 'discord.js';
import mongoose from 'mongoose';
import chalk from 'chalk';
import 'dotenv/config';
import { Event } from '../structures/Event';

export default new Event('ready', async (client) => {
  console.log(
    `The bot is ready to work.\nLogged in as ${client.user.tag}\nAPI Latency: ${client.ws.ping} ms\n`
  );
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
