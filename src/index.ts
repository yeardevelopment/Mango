import 'dotenv/config';
import { ExtendedClient } from './structures/Client';

export const client = new ExtendedClient();

import { error } from './Handlers/errors';
error();

client.start();
