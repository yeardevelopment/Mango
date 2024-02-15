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

import { Command } from '../../../structures/Command';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import premiumGuilds from '../../../utils/models/premiumGuilds';

export default new Command({
  name: 'manage-premium',
  options: [
    {
      name: 'add',
      type: ApplicationCommandOptionType.Subcommand,
      description: 'Adds a premium server',
      options: [
        {
          name: 'guild',
          type: ApplicationCommandOptionType.String,
          description: 'Guild to add to Mango Premium',
          required: true,
          min_length: 18,
          max_length: 18,
        },
        {
          name: 'expiry',
          type: ApplicationCommandOptionType.Integer,
          description: 'The expiry time in months; 0 makes this permanent',
          required: true,
        },
      ],
    },
    {
      name: 'remove',
      type: ApplicationCommandOptionType.Subcommand,
      description: 'Removes a premium server',
      options: [
        {
          name: 'guild',
          type: ApplicationCommandOptionType.String,
          description: 'Guild to remove from Mango Premium',
          required: true,
          min_length: 18,
          max_length: 18,
        },
      ],
    },
    {
      name: 'check',
      type: ApplicationCommandOptionType.Subcommand,
      description: 'Checks the status of the premium-subscribed server',
      options: [
        {
          name: 'guild',
          type: ApplicationCommandOptionType.String,
          description: 'Guild to be checked for',
          required: true,
          min_length: 18,
          max_length: 18,
        },
      ],
    },
  ],
  description: 'Manages premium guilds',
  ownerOnly: true,
  timeout: 5000,
  run: async ({ interaction, client, args }) => {
    switch (args.getSubcommand()) {
      case 'add': {
        const expiry =
          args.getInteger('expiry') > 0
            ? args.getInteger('expiry') * 86400000 * 30
            : Infinity;
        const guild = args.getString('guild');
        const data = await premiumGuilds.findOne({ Guild: guild });
        if (data && Date.now() < data.Expire)
          return interaction.reply({
            content: '⚠️ Mango Premium is already enabled in this server.',
            ephemeral: true,
          });
        if (data && Date.now() > data.Expire) {
          await premiumGuilds.findOneAndUpdate(
            { Guild: guild },
            {
              Expire: Date.now() + expiry,
            }
          );
        } else {
          await premiumGuilds.create({
            Guild: guild,
            Expire: Date.now() + expiry,
          });
        }
        interaction.reply({
          content: `Successfully enabled Mango Premium in the server ${
            expiry === Infinity
              ? 'forever'
              : `for ${args.getInteger('expiry')} months`
          }.`,
        });
        break;
      }
      case 'remove': {
        const guild = args.getString('guild');
        const data = await premiumGuilds.findOne({ Guild: guild });
        if (!data)
          return interaction.reply({
            content: `⚠️ Mango Premium is not enabled in this server.`,
            ephemeral: true,
          });
        data.deleteOne();
        interaction.reply({
          content: `Successfully disabled Mango Premium in the server.`,
        });
        break;
      }
      case 'check': {
        const guild = args.getString('guild');
        const data = await premiumGuilds.findOne({ Guild: guild });

        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Premium Status')
              .setDescription(
                `Mango Premium Status: \`${
                  data && Date.now() < data.Expire ? 'on' : 'off'
                }\`${
                  data && Date.now() < data.Expire
                    ? `\n${
                        data.Expire === Infinity
                          ? 'Enabled permanently'
                          : `<t:${Math.floor(data.Expire / 1000)}:R>`
                      }`
                    : ''
                }`
              )
              .setColor('#ea664b'),
          ],
        });
        break;
      }
    }
  },
});
