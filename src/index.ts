import 'dotenv/config';
import Discord from 'discord.js';
import { ExtendedClient } from './structures/Client';

export const client = new ExtendedClient();

export * from './Handlers/errors';

client.start();
