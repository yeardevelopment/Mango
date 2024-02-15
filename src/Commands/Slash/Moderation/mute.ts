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
import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import ms from 'ms';

export default new Command({
  name: 'mute',
  description:
    'Temporarily prevents a member from participating in text and voice channels',
  options: [
    {
      name: 'member',
      type: ApplicationCommandOptionType.User,
      description:
        'Member to be prevented from participating in text and voice channels',
      required: true,
    },
    {
      name: 'time',
      type: ApplicationCommandOptionType.String,
      description: 'Provide the duration of the mute; e.g. 1m, 1h, 1d',
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
    let time = args.getString('time');

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
        content: '⚠ You do not have enough permissions to mute the member.',
        ephemeral: true,
      });

    if ((target as GuildMember).id === interaction.user.id)
      return interaction.reply({
        content: '⚠ You cannot mute yourself.',
        ephemeral: true,
      });

    if ((target as GuildMember).id === client.user.id)
      return interaction.reply({
        content: '⚠ You cannot mute the bot.',
        ephemeral: true,
      });

    if ((target as GuildMember).isCommunicationDisabled())
      return interaction.reply({
        content: '⚠ The member is already muted.',
        ephemeral: true,
      });

    let reason = args.getString('reason') || 'No reason provided.';

    if (!ms(time))
      return interaction.reply({
        content: `⚠ Please specify a valid time.`,
        ephemeral: true,
      });
    if (ms(time) > 2419200000)
      return interaction.reply({
        content: `⚠ You cannot specify duration longer than 28 days. [Learn more ›](<https://discord.com/developers/docs/resources/guild#modify-guild-member>)`,
        ephemeral: true,
      });
    interaction.reply({
      content: `🔇 **${interaction.user.tag}** muted **${
        (target as GuildMember).user.tag
      }** for ${ms(ms(time), { long: true })}.\nReason: *${reason}*`,
    });
    (target as GuildMember).timeout(
      ms(time),
      `Muted by ${interaction.user.tag} | Reason: ${reason}`
    );

    await client.modLogs(
      {
        Action: 'Temporary Mute',
        Color: '#82ffae',
        Member: (target as GuildMember).user,
        Duration: ms(ms(time), { long: true }),
        Reason: reason,
      },
      interaction
    );
  },
});
