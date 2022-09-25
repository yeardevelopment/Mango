import {
  GuildMember,
  MessageApplicationCommandData,
  MessageContextMenuCommandInteraction,
  PermissionResolvable,
} from 'discord.js';
import { ExtendedClient } from '../structures/Client';

interface RunOptions {
  client: ExtendedClient;
  interaction: MessageContextMenuCommandInteraction;
}

type RunFunction = (options: RunOptions) => any;

export type MessageContextType = {
  timeout?: number;
  premiumOnly?: boolean;
  ownerOnly?: boolean;
  permissions?: PermissionResolvable;
  run: RunFunction;
} & MessageApplicationCommandData;
