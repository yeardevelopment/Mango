// Mango Bot - multifunctional Discord application service.
// Copyright (C) 2022  YEAR Development

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
import { EmbedBuilder } from 'discord.js';

export default new Event('interactionCreate', async (interaction) => {
  if (!interaction.guild) return;
  if (!interaction.isModalSubmit()) return;

  const modal = client.modals.get(interaction.customId);
  if (!modal)
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Unable to execute the modal`,
            iconURL: 'https://i.imgur.com/n3QHYJM.png',
          })
          .setDescription(`There was an error executing the modal. Please [contact us](https://discord.gg/QeKcwprdCY) for support.`)
          .setColor('#2F3136'),
      ],
      ephemeral: true,
    });

  modal.run({ interaction, client });
});
