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
import { ApplicationCommandOptionType, GuildMember } from 'discord.js';

export default new Command({
  name: 'unmute',
  description: "Revokes a member's mute in this server",
  options: [
    {
      name: 'member',
      type: ApplicationCommandOptionType.User,
      description: 'Member to be unmuted',
      required: true,
    },
    {
      name: 'reason',
      type: ApplicationCommandOptionType.String,
      description: 'Reason for this action',
      required: false,
    },
  ],
  permissions: 'ModerateMembers',
  timeout: 5000,
  run: async ({ interaction, client, args }) => {
    let target = args.getMember('member');

    if (target === null)
      return interaction.reply({
        content: `⚠ The user is not in the guild.`,
        ephemeral: true,
      });

    if (
      interaction.guild.ownerId !== (target as GuildMember).user.id &&
      (target as GuildMember).roles.highest.position >=
        interaction.member.roles.highest.position
    )
      return interaction.reply({
        content: '⚠ You do not have enough permissions to unmute the member.',
        ephemeral: true,
      });

    if ((target as GuildMember).id === interaction.user.id) {
      return interaction.reply({
        content: '⚠ You cannot unmute yourself.',
        ephemeral: true,
      });
    }
    if ((target as GuildMember).id === client.user.id) {
      return interaction.reply({
        content: '⚠ You cannot unmute the bot.',
        ephemeral: true,
      });
    }

    if (!(target as GuildMember).isCommunicationDisabled()) {
      return interaction.reply({
        content: '⚠ The member is not muted.',
        ephemeral: true,
      });
    }

    let reason = args.getString('reason') || 'No reason provided.';

    interaction.reply({
      content: `Successfully unmuted **${(target as GuildMember).user.tag}**.`,
    });
    (target as GuildMember).timeout(
      null,
      `Unmuted by ${interaction.user.tag} | Reason: ${reason}`
    );

    await client.modLogs(
      {
        Action: 'Unmute',
        Color: '#78c4ff',
        Member: (target as GuildMember).user,
        Reason: reason,
      },
      interaction
    );
  },
});
