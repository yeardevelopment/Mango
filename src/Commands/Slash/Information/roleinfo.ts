// Mango Bot - multifunctional Discord application service.
// Copyright (C) 2023  YEAR Development

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

import { Command } from '../../../structures/Command';
import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Role,
  PermissionsBitField,
  PermissionsString,
  time,
} from 'discord.js';
import 'dotenv/config';
import { capitalizeWords } from '../../../utils/functions/capitalizeWords';

export default new Command({
  name: 'roleinfo',
  description: 'Displays necessary information about a role',
  options: [
    {
      name: 'role',
      type: ApplicationCommandOptionType.Role,
      description: 'Role to lookup information on',
      required: true,
    },
  ],
  timeout: 5000,
  run: async ({ interaction, args }) => {
    // Defer the reply and fetch all members
    await interaction.deferReply();
    await interaction.guild.members.fetch();

    // Get the target role
    const target = args.getRole('role');

    // Check if the role is mentionable or hoisted
    const mentionable = target.mentionable !== true ? 'No' : 'Yes';
    const hoisted = target.hoist !== true ? 'No' : 'Yes';

    // Get the role's color
    let color = '';
    if ((target as Role).hexColor === '#000000') color = 'None';
    if ((target as Role).hexColor !== '#000000')
      color = (target as Role).hexColor;

    // Get the role's key permissions
    const exemptedItems: PermissionsString[] = [
      'Administrator',
      'BanMembers',
      'KickMembers',
      'ManageChannels',
      'ManageEmojisAndStickers',
      'ManageEvents',
      'ManageGuild',
      'ManageMessages',
      'ManageNicknames',
      'ManageRoles',
      'ManageWebhooks',
      'MentionEveryone',
      'ModerateMembers',
    ];
    const permissionsArray = (
      target.permissions as PermissionsBitField
    ).toArray();
    const filtered = permissionsArray.filter((item) =>
      exemptedItems.includes(item)
    );
    const keyPermissions =
      capitalizeWords({
        string: filtered
          .join(', ')
          .replaceAll(/([A-Z])/g, ' $1')
          .toLowerCase()
          .replaceAll('guild', 'server'),
      }) || 'None';

    // Get the role's icon URL
    const icon = !target.icon
      ? 'None'
      : `[Click here ›](${(target as Role).iconURL()})`;

    // Create an embed
    const embed = new EmbedBuilder()
      .setTitle(`Role Information`)
      .setDescription(
        `**Name**: ${
          target.name
        }\n**HEX Color**: ${color}\n**Role Icon**: ${icon}\n**Position**: ${
          target.position
        }\n**Hoisted**: ${hoisted}\n**Mentionable**: ${mentionable}\n**Users in Role**: ${
          (target as Role).members.size
        }\n**Role Created**: ${time(
          (target as Role).createdAt
        )} (<t:${Math.floor(
          (target as Role).createdTimestamp / 1000
        )}:R>)\n**Key Permissions**: ${keyPermissions}`
      )
      .setFooter({ text: `ID: ${target.id}` })
      .setColor('#ea664b');

    // Edit the initial reply with the embed
    interaction.editReply({
      embeds: [embed],
    });
  },
});
