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
  ButtonInteraction,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { Button } from '../../../structures/Button';
import ticket from '../../../utils/models/ticket';
import tickets from '../../../utils/models/tickets';

export default new Button({
  id: 'ticket',
  run: async ({ interaction }) => {
    const ticketSystem = await ticket.findOne({
      Guild: interaction.guildId,
      Toggled: true,
    });
    if (!ticketSystem) return;
    if (!ticketSystem.StaffRole)
      return (interaction as ButtonInteraction).reply({
        content:
          '⚠️ The ticket system is not set up properly yet. Please contact staff with this information.',
        ephemeral: true,
      });
    const ticketChannel = await tickets.findOne({
      Guild: interaction.guildId,
      Member: interaction.user.id,
    });
    if (ticketChannel)
      return interaction.reply({
        content: `<:cancel:996733678279462932> You already have a ticket open: <#${ticketChannel.ID}>.`,
        ephemeral: true,
      });
    interaction.showModal(
      new ModalBuilder()
        .setTitle('Ticket System')
        .setCustomId('ticket-modal')
        .addComponents([
          new ActionRowBuilder().addComponents([
            new TextInputBuilder()
              .setLabel('Why are you opening this ticket?')
              .setCustomId('reason')
              .setMaxLength(100)
              .setRequired()
              .setStyle(TextInputStyle.Short),
          ]) as ActionRowBuilder<TextInputBuilder>,
        ])
    );
  },
});
