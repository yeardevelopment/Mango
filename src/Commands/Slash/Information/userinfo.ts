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
import { EmbedBuilder, ApplicationCommandOptionType, time } from 'discord.js';
import 'dotenv/config';
import { listRoles } from '../../../utils/functions/listRoles';

export default new Command({
  name: 'userinfo',
  description: 'Displays detailed information about a user',
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionType.User,
      description: 'User to lookup information on',
      required: false,
    },
  ],
  timeout: 5000,
  run: async ({ interaction, args }) => {
    await interaction.deferReply();
    const target = args.getUser('user') || interaction.user;
    await target.fetch();
    const isMember = interaction.guild.members.cache.get(target.id);

    const statusType = {
      idle: 'Idle',
      dnd: 'Do Not Disturb',
      online: 'Online',
      offline: 'Offline',
    };

    const flags = {
      ActiveDeveloper: '<:active_dev:1098348295362969630>',
      CertifiedModerator: '<:certifiied_moderator:998581289370271764>',
      Hypesquad: '<:hypesquad_events:998581293338067054>',
      HypeSquadOnlineHouse1: '<:hypesquad_bravery:998581300342575185>',
      HypeSquadOnlineHouse2: '<:hypesquad_brilliance:998581291828138014>',
      HypeSquadOnlineHouse3: '<:hypesquad_balance:998581297817583686>',
      PremiumEarlySupporter: '<:early_supporter:998583447461298276>',
    };

    const embed = new EmbedBuilder()
      .setTitle(
        `${target.username}${
          target.username.endsWith('s') ? "'" : "'s"
        } User Information`
      )
      .setColor('#ea664b')
      .setThumbnail(target.displayAvatarURL())
      .setFooter({ text: `ID: ${target.id}` })
      .setDescription(
        `${
          target.flags.toArray().length
            ? target.flags.toArray().map((flag) => `${flags[flag]} `)
            : 'None'
        } ${
          target.displayAvatarURL().endsWith('.gif') ||
          target.bannerURL() ||
          target.discriminator === '0001'
            ? '<:nitro:998584423433908224>'
            : ''
        } ${
          isMember?.premiumSince ? '<:booster:998584842121904198>' : ''
        }\n\n**Tag**: \`${target.tag}\`\n**Account Created**: ${time(
          target.createdAt
        )} (<t:${Math.floor(target.createdTimestamp / 1000)}:R>)${
          isMember
            ? `\n**Joined the Server**: ${time(
                isMember.joinedAt
              )} (<t:${Math.floor(
                isMember.joinedTimestamp / 1000
              )}:R>)\n**Status**: ${
                statusType[isMember.presence?.status || 'offline']
              }\n**Activities**: ${
                isMember.presence?.activities
                  .map((activity) => activity.name)
                  .join(', ') || 'None'
              }\n**Roles**: ${listRoles({ member: isMember })}`
            : ''
        }\n**Link**: [Click here ›](https://lookup.guru/${target.id})`
      )
      .setImage(
        target.bannerURL({ size: 4096 }) ||
          `https://singlecolorimage.com/get/${target.hexAccentColor?.slice(
            1
          )}/600x240` ||
          null
      );

    interaction.editReply({
      embeds: [embed],
    });
  },
});
