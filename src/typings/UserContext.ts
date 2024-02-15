// Mango Bot - multifunctional Discord application service.
// Copyright (C) 2024  YEAR Development

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

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
