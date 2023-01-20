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

import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  TextBasedChannel,
} from 'discord.js';
import { join } from 'path';
import { client } from '..';
import { Event } from '../structures/Event';
import db from '../utils/models/config';

export default new Event('guildCreate', async (guild) => {
  guild.members.me.setNickname('Mango');
  const chats = guild.channels.cache.find(
    (channel) =>
      channel.name.includes('staff-chat') ||
      channel.name.includes('admin-chat') ||
      channel.name === 'bot-commands' ||
      channel.name === 'commands'
  );

  const channel = chats ? chats : guild.systemChannel;

  const attachment = new AttachmentBuilder(
    join(__dirname, `../../assets/Images/thankyou.png`),
    {
      name: 'thankyou.png',
    }
  );

  (channel as TextBasedChannel)?.send({
    embeds: [
      new EmbedBuilder()
        .setTitle(':pray: Thank you for inviting me!')
        .setDescription(
          "Mango is focused on efficiency and performance. It's designed to be an easy-to-use and user-friendly bot to provide you with the best experience. We aim to make it more and more comfortable for you to use our Services and we welcome any suggestions from you in our [Discord server](https://discord.gg/B8Fs6Qe6Eq)."
        )
        .setColor('#ea664b')
        .setImage('attachment://thankyou.png'),
    ],
    files: [attachment],
    components: [
      new ActionRowBuilder().addComponents([
        new ButtonBuilder()
          .setLabel('Support Server')
          .setEmoji({ name: 'support', id: '996734485120962591' })
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.gg/QeKcwprdCY'),
        new ButtonBuilder()
          .setLabel('Terms & Conditions')
          .setEmoji({ name: 'terms', id: '996733685313323059' })
          .setStyle(ButtonStyle.Link)
          .setURL('https://yearcommunity.wixsite.com/main/terms'),
        new ButtonBuilder()
          .setLabel('Privacy Policy')
          .setEmoji({ name: 'privacy', id: '996733682175987723' })
          .setStyle(ButtonStyle.Link)
          .setURL('https://yearcommunity.wixsite.com/main/privacy'),
      ]) as ActionRowBuilder<ButtonBuilder>,
    ],
  });

  const data = await db.findOne({ Guild: guild.id });
  if (!data)
    await db.create({
      Guild: guild.id,
    });
});
