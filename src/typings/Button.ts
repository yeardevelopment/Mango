import { ButtonInteraction, PermissionResolvable } from 'discord.js';
import { ExtendedClient } from '../structures/Client';

interface RunOptions {
  interaction: ButtonInteraction;
  client: ExtendedClient;
}

type RunFunction = (options: RunOptions) => any;

export type ButtonType = {
  id: string;
  ownerOnly?: boolean;
  permissions?: PermissionResolvable;
  run: RunFunction;
};
