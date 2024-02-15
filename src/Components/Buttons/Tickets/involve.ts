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
  GuildMemberRoleManager,
  UserSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} from 'discord.js';
import { Button } from '../../../structures/Button';
import ticket from '../../../utils/models/ticket';

export default new Button({
  id: 'ticket-involve',
  run: async ({ interaction }) => {
    const ticketSystem = await ticket.findOne({
      Guild: interaction.guildId,
      Toggled: true,
    });
    if (!ticketSystem) return;
    if (interaction.channel.parentId !== ticketSystem.Category) return;
    if (
      !(interaction.member.roles as GuildMemberRoleManager).cache.has(
        ticketSystem.StaffRole
      )
    )
      return interaction.reply({
        content: '⚠ Only staff can involve people into the ticket.',
        ephemeral: true,
      });

    const menu = new UserSelectMenuBuilder()
      .setCustomId('ticket-member-involve')
      .setPlaceholder('Choose a member to involve to the ticket')
      .setMinValues(1)
      .setMaxValues(1);

    interaction.reply({
      components: [
        new ActionRowBuilder().addComponents(
          menu
        ) as ActionRowBuilder<ButtonBuilder>,
      ],
      ephemeral: true,
    });
  },
});
