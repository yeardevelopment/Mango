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
import {
  ButtonInteraction,
  EmbedBuilder,
  PermissionsBitField,
} from 'discord.js';
import { capitalizeWords } from '../utils/functions/capitalizeWords';
import buttons from '../utils/models/buttons';

export default new Event('interactionCreate', async (interaction) => {
  if (!interaction.guild) return;
  if (!interaction.isButton()) return;

  const button = client.buttons.get(interaction.customId);
  if (!button)
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Unable to execute the button`,
            iconURL: 'https://i.imgur.com/n3QHYJM.png',
          })
          .setDescription(
            `There was an error executing the button. Please [contact us](https://discord.gg/QeKcwprdCY) for support.`
          )
          .setColor('#2F3136'),
      ],
      ephemeral: true,
    });

  if (
    button.permissions &&
    !(interaction.member.permissions as PermissionsBitField).has(
      button.permissions
    )
  )
    return interaction.reply({
      content: `**✋ Hold on!**\nYou need to have \`${capitalizeWords({
        string: (button.permissions as string)
          .replaceAll(/([A-Z])/g, ' $1')
          .toLowerCase()
          .replaceAll('guild', 'server')
          .substring(1),
      })}\` permission to use this button.`,
      ephemeral: true,
    });

  if (button.ownerOnly) {
    if (!(await client.config).owners.includes(interaction.user.id))
      return interaction.reply({
        content: '⚠️ You cannot use this button.',
        ephemeral: true,
      });
  }
  try {
    button.run({ interaction, client });
    await buttons.create({
      User: interaction.user.id,
      Guild: interaction.guildId,
      Interaction: interaction.id,
      Button: button.id,
      Success: true,
      Error: null,
    });
  } catch (error) {
    await buttons
      .create({
        User: interaction.user.id,
        Guild: interaction.guildId,
        Interaction: interaction.id,
        Command: button.id,
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
