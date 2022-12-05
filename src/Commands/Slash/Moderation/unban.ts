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

import { Command } from '../../../structures/Command';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command({
  name: 'unban',
  description: "Revokes a member's ban in this server",
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionType.User,
      description: 'ID of a user to be unbanned',
      required: true,
    },
    {
      name: 'reason',
      type: ApplicationCommandOptionType.String,
      description: 'Reason for this action',
      required: false,
    },
  ],
  permissions: 'BanMembers',
  timeout: 5000,
  run: async ({ interaction, client, args }) => {
    let target = args.getUser('user');

    if (target.id === interaction.user.id)
      return interaction.reply({
        content: '⚠ You cannot unban yourself.',
        ephemeral: true,
      });

    if (target.id === client.user.id)
      return interaction.reply({
        content: '⚠ You cannot unban the bot.',
        ephemeral: true,
      });

    let reason = args.getString('reason') || 'No reason provided.';

    await interaction.guild.bans.fetch().then(async (bans) => {
      if (bans.size === 0)
        return interaction.reply({
          content: '⚠ No one is banned in this server.',
          ephemeral: true,
        });
      let banned = bans.find((ban) => ban.user.id === target.id);
      if (!banned)
        return interaction.reply({
          content: '⚠ The user is not banned.',
          ephemeral: true,
        });
    });

    await interaction.guild.members.unban(
      target.id,
      `Unbanned by ${interaction.user.tag} | Reason: ${reason}`
    );
    await interaction.reply({
      content: `Successfully unbanned **${target.tag}**.`,
      ephemeral: false,
    });

    await client.modLogs(
      {
        Action: 'Unban',
        Color: '#009A44',
        Member: target,
        Reason: reason,
      },
      interaction
    );
  },
});
