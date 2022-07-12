import Discord from 'discord.js';
import mongoose from 'mongoose';
import 'dotenv/config';
import { Event } from '../structures/Event';

export default new Event('ready', async (client) => {
  await mongoose
    .connect(process.env.MONGO_URI || '', {
      keepAlive: true,
    })
    .then(() => {
      console.log('Successfully connected to the database.');
    })
    .catch((error) => console.error(error));
});
