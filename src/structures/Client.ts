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
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  Collection,
  GatewayIntentBits,
  Partials,
} from 'discord.js';
import { CommandType } from '../typings/Command';
import { glob } from 'glob';
import { RegisterCommandsOptions } from '../typings/client';
import { modlogs } from '../utils/functions/modLogs';
import { Event } from './Event';
import { ButtonType } from '../typings/Button';
import { ModalType } from '../typings/Modal';
import { UserContextType } from '../typings/UserContext';
import { MessageContextType } from '../typings/MessageContext';
import { UserSelectMenuType } from '../typings/UserSelectMenu';
export class ExtendedClient extends Client {
  buttons: Collection<string, ButtonType> = new Collection();
  commands: Collection<string, CommandType> = new Collection();
  modals: Collection<string, ModalType> = new Collection();
  userContexts: Collection<string, UserContextType> = new Collection();
  messageContexts: Collection<string, MessageContextType> = new Collection();
  userSelectMenus: Collection<string, UserSelectMenuType> = new Collection();
  config = import('../Configuration/config.json');
  modLogs = modlogs;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
      ],
      partials: [
        Partials.GuildMember,
        Partials.Channel,
        Partials.Message,
        Partials.User,
      ],
    });
  }

  start() {
    this.registerModules();
    this.login(process.env.TOKEN);
  }
  async importFile(filePath: string) {
    return (await import(filePath))?.default;
  }

  async registerCommands({ commands }: RegisterCommandsOptions) {
    this.application?.commands.set(commands);
    console.log('Registering global commands.');
  }

  async registerModules() {
    // Commands
    const commands: ApplicationCommandDataResolvable[] = [];
    const slashCommandFiles = await glob(
      `${__dirname}/../Commands/Slash/*/*{.ts,.js}`
    );
    const userContextFiles = await glob(
      `${__dirname}/../Commands/User Contexts/*/*{.ts,.js}`
    );
    const messageContextFiles = await glob(
      `${__dirname}/../Commands/Message Contexts/*/*{.ts,.js}`
    );

    slashCommandFiles.forEach(async (filePath) => {
      const command: CommandType = await this.importFile(filePath);
      if (!command.name) return;

      this.commands.set(command.name, command);
      commands.push(command);
    });

    userContextFiles.forEach(async (filePath) => {
      const userContext: UserContextType = await this.importFile(filePath);
      if (!userContext.name) return;

      this.userContexts.set(userContext.name, userContext);
      commands.push(userContext);
    });

    messageContextFiles.forEach(async (filePath) => {
      const messageContext: MessageContextType = await this.importFile(
        filePath
      );
      if (!messageContext.name) return;

      this.messageContexts.set(messageContext.name, messageContext);
      commands.push(messageContext);
    });

    this.on('ready', () => {
      this.registerCommands({
        commands,
        guildId: process.env.guildId,
      });
    });

    // Buttons
    const buttonFiles = await glob(
      `${__dirname}/../Components/Buttons/*/*{.ts,.js}`
    );
    for (const filePath of buttonFiles) {
      const button: ButtonType = await this.importFile(filePath);
      if (!button.id) return;

      this.buttons.set(button.id, button);
    }

    // Select Menus
    const userSelectMenuFiles = await glob(
      `${__dirname}/../Components/User Select Menus/*/*{.ts,.js}`
    );
    for (const filePath of userSelectMenuFiles) {
      const userSelectMenu: UserSelectMenuType = await this.importFile(
        filePath
      );
      if (!userSelectMenu.id) return;

      this.userSelectMenus.set(userSelectMenu.id, userSelectMenu);
    }

    // Modals
    const modalFiles = await glob(
      `${__dirname}/../Components/Modals/*/*{.ts,.js}`
    );
    for (const filePath of modalFiles) {
      const modal: ModalType = await this.importFile(filePath);
      if (!modal.id) return;

      this.modals.set(modal.id, modal);
    }

    // Event
    const eventFiles = await glob(`${__dirname}/../Events/*{.ts,.js}`);
    for (const filePath of eventFiles) {
      const event: Event<keyof ClientEvents> = await this.importFile(filePath);
      this.on(event.event, event.run);
    }
  }
}
