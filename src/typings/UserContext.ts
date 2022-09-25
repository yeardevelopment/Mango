import {
  GuildMember,
  PermissionResolvable,
  UserApplicationCommandData,
  UserContextMenuCommandInteraction,
} from 'discord.js';
import { ExtendedClient } from '../structures/Client';

export interface ExtendedInteraction extends UserContextMenuCommandInteraction {
  member: GuildMember;
}

interface RunOptions {
  client: ExtendedClient;
  interaction: ExtendedInteraction;
}

type RunFunction = (options: RunOptions) => any;

export type UserContextType = {
  timeout?: number;
  premiumOnly?: boolean;
  ownerOnly?: boolean;
  permissions?: PermissionResolvable;
  run: RunFunction;
} & UserApplicationCommandData;
