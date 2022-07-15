import 'dotenv/config';
import Discord from 'discord.js';
import { ExtendedClient } from './structures/Client';

export const client = new ExtendedClient();

import './Handlers/errors';

client.start();
