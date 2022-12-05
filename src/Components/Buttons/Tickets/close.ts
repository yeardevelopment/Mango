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

import {
  GuildMemberRoleManager,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import { Button } from '../../../structures/Button';
import ticket from '../../../utils/models/ticket';
import tickets from '../../../utils/models/tickets';

export default new Button({
  id: 'close',

  run: async ({ interaction }) => {
    const ticketSystem = await ticket.findOne({
      Guild: interaction.guildId,
      Toggled: true,
    });
    if (!ticketSystem) return;
    if (
      !(interaction.member.roles as GuildMemberRoleManager).cache.has(
        ticketSystem.StaffRole
      )
    )
      return interaction.reply({
        content: '⚠ Only staff can close the ticket.',
        ephemeral: true,
      });
    const docs = await tickets.findOne({ ID: interaction.channelId });
    if (docs.Closed === true) {
      return interaction.reply({
        content: 'This ticket is already being closed.',
        ephemeral: true,
      });
    }
    let row = new ActionRowBuilder().addComponents([
      new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setEmoji({ name: 'success', id: '996733680422752347' })
        .setLabel('Proceed')
        .setCustomId('sure'),
    ]);
    interaction.reply({
      components: [row as ActionRowBuilder<ButtonBuilder>],
      embeds: [
        new EmbedBuilder()
          .setTitle('⚠ Are you sure?')
          .setDescription(
            'Are you sure you want to close this ticket?\nThis action cannot be undone.'
          )
          .setColor('#e03c3c'),
      ],
      ephemeral: true,
      fetchReply: true,
    });
  },
});
