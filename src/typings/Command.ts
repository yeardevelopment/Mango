import {
  ChatInputApplicationCommandData,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  PermissionResolvable,
} from 'discord.js';
import { ExtendedClient } from '../structures/Client';

/**
 * {
 *  name: "commandname",
 * description: "any description",
 * run: async({ interaction }) => {
 *
 * }
 * }
 */
export interface ExtendedInteraction extends CommandInteraction {
  member: GuildMember;
}

interface RunOptions {
  client: ExtendedClient;
  interaction: ExtendedInteraction;
  args: CommandInteractionOptionResolver;
}

type RunFunction = (options: RunOptions) => any;

export type CommandType = {
  timeout?: number;
  premiumOnly?: boolean;
  ownerOnly?: boolean;
  permissions?: PermissionResolvable;
  run: RunFunction;
} & ChatInputApplicationCommandData;
