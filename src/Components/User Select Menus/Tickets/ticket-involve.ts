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

import { GuildChannel } from 'discord.js';
import { UserSelectMenu } from '../../../structures/UserSelectMenu';
import tickets from '../../../utils/models/tickets';

export default new UserSelectMenu({
  id: 'ticket-member-involve',
  run: async ({ interaction, client }) => {
    const member = interaction.values[0];

    const data = await tickets.findOne({ ID: interaction.channel.id });
    if (data.Members.includes(member))
      return interaction.reply({
        content: `⚠ The member is already invloved in the ticket.`,
        ephemeral: true,
      });

    data.Members.push(member);
    data.save();

    (interaction.channel as GuildChannel).permissionOverwrites.create(member, {
      SendMessages: true,
      ViewChannel: true,
      AttachFiles: true,
      ReadMessageHistory: true,
      AddReactions: true,
    });

    interaction.reply({
      content: `<:success:996733680422752347> Successfully involved <@${member}> into this ticket.`,
      ephemeral: true,
    });
  },
});
