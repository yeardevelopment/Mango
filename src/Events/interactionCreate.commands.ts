// Mango Bot - multifunctional Discord application service.
// Copyright (C) 2023  YEAR Development

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

import {
  Collection,
  CommandInteractionOptionResolver,
  EmbedBuilder,
  PermissionsBitField,
  CommandInteraction,
} from 'discord.js';
import ms from 'ms';
import chalk from 'chalk';
const Timeout = new Collection();
import { client } from '..';
import { Event } from '../structures/Event';
import { ExtendedInteraction } from '../typings/Command';
import premiumGuilds from '../utils/models/premiumGuilds';
import { capitalizeWords } from '../utils/functions/capitalizeWords';
import commands from '../utils/models/commands';

export default new Event('interactionCreate', async (interaction) => {
  if (!interaction.guild) return; // Interactions can only be called used within a guild
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command)
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Unable to execute the command`,
            iconURL: 'https://i.imgur.com/n3QHYJM.png',
          })
          .setDescription(
            `There was an error executing the command. Please [contact us](https://discord.gg/QeKcwprdCY) for support.`
          )
          .setColor('#2F3136'),
      ],
      ephemeral: true,
    });

  if (command.ownerOnly) {
    if (!(await client.config).owners.includes(interaction.user.id))
      return interaction.reply({
        content: '⚠️ You cannot use this command.',
        ephemeral: true,
      });
  }

  if (command.premiumOnly) {
    const data = await premiumGuilds.findOne({ Guild: interaction.guildId });
    if (Date.now() > data.Expire) {
      data.deleteOne();
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('This is a Mango Premium command')
            .setDescription(
              'This command only works within servers that are subscribed to Mango Premium. You can ask owners to subscribe to it.'
            )
            .setColor('#e03c3c'),
        ],
      });
    }
  }

  if (
    command.permissions &&
    !(interaction.member.permissions as PermissionsBitField).has(
      command.permissions
    )
  )
    return interaction.reply({
      content: `**✋ Hold on!**\nYou need to have \`${capitalizeWords({
        string: (command.permissions as string)
          .replaceAll(/([A-Z])/g, ' $1')
          .toLowerCase()
          .replaceAll('guild', 'server')
          .substring(1),
      })}\` permission to use this command.`,
      ephemeral: true,
    });

  if (command.timeout) {
    if (Timeout.has(`${command.name}${interaction.user.id}`))
      return await interaction.reply({
        content: `**🛑 Chill there!**\nYou are on a \`${ms(
          (Timeout.get(`${command.name}${interaction.user.id}`) as number) -
            Date.now(),
          { long: true }
        )}\` cooldown.`,
        ephemeral: true,
      });
  }

  try {
    command.run({
      args: interaction.options as CommandInteractionOptionResolver,
      client,
      interaction: interaction as ExtendedInteraction,
    });
    await commands.create({
      User: interaction.user.id,
      Guild: interaction.guildId,
      Interaction: interaction.id,
      Command: `/${command.name}`,
      Parameters: interaction.options.data,
      Success: true,
      Error: null,
    });
    console.log(
      `${interaction.user.tag} (${
        interaction.user.id
      }) executed ${chalk.bold.green(command.name)}. Interaction ID: ${
        interaction.id
      }`
    );
    Timeout.set(
      `${command.name}${interaction.user.id}`,
      Date.now() + command.timeout
    );
    setTimeout(() => {
      Timeout.delete(`${command.name}${interaction.user.id}`);
    }, command.timeout);
  } catch (error) {
    await commands
      .create({
        User: interaction.user.id,
        Guild: interaction.guildId,
        Interaction: interaction.id,
        Command: `/${command.name}`,
        Parameters: interaction.options.data,
        Success: false,
        Error: error,
      })
      .then((document) => {
        if (interaction.replied) {
          interaction.editReply({
            content: null,
            embeds: [
              new EmbedBuilder()
                .setAuthor({
                  name: 'Error Occurred',
                  iconURL: 'https://i.imgur.com/n3QHYJM.png',
                })
                .setDescription(
                  `There was an error executing the interaction. Please [contact us](https://discord.gg/QeKcwprdCY) with this error ID: \`${interaction.id}\`.`
                )
                .setColor('#2F3136'),
            ],
          });
        } else {
          interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setAuthor({
                  name: 'Error Occurred',
                  iconURL: 'https://i.imgur.com/n3QHYJM.png',
                })
                .setDescription(
                  `There was an error executing the interaction. Please [contact us](https://discord.gg/QeKcwprdCY) with the following error ID: \`${interaction.id}\`.`
                )
                .setColor('#2F3136'),
            ],
          });
        }
      });
  }
});
