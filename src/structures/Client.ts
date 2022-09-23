import {
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  Collection,
  GatewayIntentBits,
  Partials,
} from 'discord.js';
import { CommandType } from '../typings/Command';
import glob from 'glob';
import { promisify } from 'util';
import { RegisterCommandsOptions } from '../typings/client';
import { modlogs } from '../utils/functions/modLogs';
import { Event } from './Event';
import { ButtonType } from '../typings/Button';
import { ModalType } from '../typings/Modal';

const globPromise = promisify(glob);

export class ExtendedClient extends Client {
  buttons: Collection<string, ButtonType> = new Collection();
  commands: Collection<string, CommandType> = new Collection();
  modals: Collection<string, ModalType> = new Collection();
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

  async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
    if (guildId) {
      this.guilds.cache.get(guildId)?.commands.set(commands);
      console.log(`Registering commands to ${guildId}`);
    } else {
      this.application?.commands.set(commands);
      console.log('Registering global commands.');
    }
  }

  async registerModules() {
    // Commands
    const slashCommands: ApplicationCommandDataResolvable[] = [];
    const commandFiles = await globPromise(
      `${__dirname}/../Commands/*/*{.ts,.js}`
    );

    commandFiles.forEach(async (filePath) => {
      const command: CommandType = await this.importFile(filePath);
      if (!command.name) return;

      this.commands.set(command.name, command);
      slashCommands.push(command);
    });

    this.on('ready', () => {
      this.registerCommands({
        commands: slashCommands,
        guildId: process.env.guildId,
      });
    });

    // Buttons
    const buttonFiles = await globPromise(
      `${__dirname}/../Buttons/*/*{.ts,.js}`
    );
    for (const filePath of buttonFiles) {
      const button: ButtonType = await this.importFile(filePath);
      if (!button.id) return;

      this.buttons.set(button.id, button);
    }

    // Modals
    const modalFiles = await globPromise(`${__dirname}/../Modals/*/*{.ts,.js}`);
    for (const filePath of modalFiles) {
      const modal: ModalType = await this.importFile(filePath);
      if (!modal.id) return;

      this.modals.set(modal.id, modal);
    }

    // Event
    const eventFiles = await globPromise(`${__dirname}/../Events/*{.ts,.js}`);
    for (const filePath of eventFiles) {
      const event: Event<keyof ClientEvents> = await this.importFile(filePath);
      this.on(event.event, event.run);
    }
  }
}
