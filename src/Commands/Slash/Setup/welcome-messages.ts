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

import { Command } from '../../../structures/Command';
import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  ChannelType,
} from 'discord.js';
import db from '../../../utils/models/welcomeMessages';

export default new Command({
  name: 'welcome',
  description: 'Welcome System Command',
  options: [
    {
      name: 'toggle',
      description: 'Enables/disables welcome messages in this server',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'message',
      type: ApplicationCommandOptionType.Subcommand,
      description:
        "Text to be sent when a member joins the guild; add '@' to mention the joined member",
      options: [
        {
          name: 'message',
          description:
            "Text to be sent when a member joins the guild; add '@' to mention the joined member",
          type: ApplicationCommandOptionType.String,
          required: true,
          min_length: 1,
          max_length: 256,
        },
      ],
    },
    {
      name: 'image',
      type: ApplicationCommandOptionType.Subcommand,
      description: 'Enables/disables the welcome image in this server',
    },
    {
      name: 'channel',
      description:
        'Sets the channel that will be used for sending welcome messages',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'channel',
          description: 'Channel to be used for for sending welcome messages',
          channelTypes: [ChannelType.GuildText],
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
      ],
    },
    {
      name: 'settings',
      description:
        'Displays the settings of the welcome system for this server.',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  permissions: 'ManageGuild',
  timeout: 5000,
  run: async ({ interaction, args }) => {
    switch (args.getSubcommand()) {
      case 'toggle': {
        const data = await db.findOne({ Guild: interaction.guildId });
        if (data && data.Toggled) {
          await db.findOneAndUpdate(
            { Guild: interaction.guildId },
            { $set: { Toggled: false } }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully disabled welcome messages in this server.',
          });
        } else if (data && data.Toggled === false) {
          await db.findOneAndUpdate(
            { Guild: interaction.guildId },
            { $set: { Toggled: true } }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled welcome messages in this server.',
          });
        } else {
          await db.create({
            Guild: interaction.guildId,
            Toggled: true,
          });
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled welcome messages in this server.',
          });
        }
        break;
      }

      case 'message': {
        const message = args.getString('message');
        const data = await db.findOne({ Guild: interaction.guildId });
        if (data) {
          await db.findOneAndUpdate(
            {
              Guild: interaction.guildId,
            },
            { $set: { Text: message } }
          );
        } else {
          await db.create({ Guild: interaction.guildId, Text: message });
        }
        interaction.reply({
          content:
            '<:success:996733680422752347> Successfully updated the welcome message in this server.',
        });
        break;
      }

      case 'channel': {
        const channel = args.getChannel('channel');
        const isChannel = channel ? channel.id : '';
        const data = await db.findOne({ Guild: interaction.guildId });
        if (data) {
          await db.findOneAndUpdate(
            {
              Guild: interaction.guildId,
            },
            { $set: { Channel: isChannel } }
          );
        } else {
          await db.create({ Guild: interaction.guildId, Channel: isChannel });
        }
        interaction.reply({
          content:
            '<:success:996733680422752347> Successfully updated the welcome message in this server.',
        });
        break;
      }

      case 'image': {
        const data = await db.findOne({ Guild: interaction.guildId });
        if (data && data.Image) {
          await db.findOneAndUpdate(
            { Guild: interaction.guildId },
            { $set: { Image: false } }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully disabled the welcome image in this server.',
          });
        } else if (data && data.Image === false) {
          await db.findOneAndUpdate(
            { Guild: interaction.guildId },
            { $set: { Image: true } }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled the welcome image in this server.',
          });
        } else {
          await db.create({
            Guild: interaction.guildId,
            Image: true,
          });
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled the welcome image in this server.',
          });
        }
        break;
      }

      case 'settings': {
        const data = await db.findOne({ Guild: interaction.guildId });

        if (data) {
          interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Welcome System | Settings')
                .setColor('#ea664b')
                .setDescription(
                  `${
                    data.Toggled
                      ? '<:on:997453570188259369> System is __enabled__.'
                      : '<:off:997453568908988507> System is __disabled__.'
                  }\n${
                    data.Channel
                      ? `<:on:997453570188259369> Channel set to <#${data.Channel}>.`
                      : '<:off:997453568908988507> Channel is unset.'
                  }\n${
                    data.Text
                      ? `<:on:997453570188259369> Message set to \`${data.Text}\`.`
                      : '<:off:997453568908988507> Message is unset.'
                  }`
                ),
            ],
          });
        } else {
          await db.create({
            Guild: interaction.guildId,
          });

          interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Welcome System | Settings')
                .setColor('#ea664b')
                .setDescription(
                  `${
                    data.Toggled
                      ? '<:on:997453570188259369> System is __enabled__.'
                      : '<:off:997453568908988507> System is __disabled__.'
                  }\n${
                    data.Channel
                      ? `<:on:997453570188259369> Channel set to <#${data.Channel}>.`
                      : '<:off:997453568908988507> Channel is unset.'
                  }\n${
                    data.Text
                      ? `<:on:997453570188259369> Message set to \`${data.Text}\`.`
                      : '<:off:997453568908988507> Message is unset.'
                  }`
                ),
            ],
          });
        }
        break;
      }
    }
  },
});
