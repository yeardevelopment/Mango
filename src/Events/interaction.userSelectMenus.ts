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

import { Event } from '../structures/Event';
import { client } from '..';
import { EmbedBuilder, PermissionsBitField } from 'discord.js';
import { capitalizeWords } from '../utils/functions/capitalizeWords';

export default new Event('interactionCreate', async (interaction) => {
  if (!interaction.guild) return;
  if (!interaction.isUserSelectMenu()) return;

  const userSelectMenu = client.userSelectMenus.get(interaction.customId);
  if (!userSelectMenu)
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Unable to execute the select menu`,
            iconURL: 'https://i.imgur.com/n3QHYJM.png',
          })
          .setDescription(
            `There was an error executing the select menu. Please [contact us](https://discord.gg/QeKcwprdCY) for support.`
          )
          .setColor('#2F3136'),
      ],
      ephemeral: true,
    });

  if (
    userSelectMenu.permissions &&
    !(interaction.member.permissions as PermissionsBitField).has(
      userSelectMenu.permissions
    )
  )
    return interaction.reply({
      content: `**✋ Hold on!**\nYou need to have \`${capitalizeWords({
        string: (userSelectMenu.permissions as string)
          .replaceAll(/([A-Z])/g, ' $1')
          .toLowerCase()
          .replaceAll('guild', 'server')
          .substring(1),
      })}\` permission to use this select menu.`,
      ephemeral: true,
    });

  if (userSelectMenu.ownerOnly) {
    if (!(await client.config).owners.includes(interaction.user.id))
      return interaction.reply({
        content: '⚠️ You cannot use this select menu.',
        ephemeral: true,
      });
  }
  userSelectMenu.run({ interaction, client });
});
