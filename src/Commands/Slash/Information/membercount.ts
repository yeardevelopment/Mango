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
import { EmbedBuilder } from 'discord.js';

export default new Command({
  name: 'membercount',
  description:
    "Displays the server's members count along with online members count",
  timeout: 5000,
  run: async ({ interaction }) => {
    // Fetch all members with presences
    const members = await interaction.guild.members.fetch({
      withPresences: true,
    });

    // Filter out the online members
    const onlineMembers = members.filter(
      (member) =>
        member.presence?.status === 'online' ||
        member.presence?.status === 'idle' ||
        member.presence?.status === 'dnd'
    );

    // Send an embed with the member count information
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Member Count')
          .setDescription(
            `**Total Members**: ${interaction.guild.memberCount}\n**Online Members**: ${onlineMembers.size}`
          )
          .setColor('#ea664b'),
      ],
    });
  },
});
