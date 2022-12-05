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

import messageLogs from '../utils/models/messageLogs';
import { EmbedBuilder, TextBasedChannel } from 'discord.js';
import { Event } from '../structures/Event';
import { client } from '..';

export default new Event('messageDelete', async (message) => {
  if (message.author?.bot || !message.guild) return;

  const data = await messageLogs.findOne({
    Guild: message.guildId,
    Toggled: true,
  });
  if (!data || !data?.Channel) return;

  const Embed = new EmbedBuilder()
    .setTitle('📕 Message Deleted')
    .setFields([
      {
        name: 'Content:',
        value: `\`\`\`${
          message.content.length > 1015
            ? `${message.content.slice(0, 1015)}...`
            : message.content
        }\`\`\``,
      },
    ])
    .setColor('#da2c43')
    .setFooter({ text: `Message ID: ${message.id}` })
    .setTimestamp();

  if (message.attachments.size >= 1) {
    Embed.setDescription(
      `**Sent By**: \`${message.author.tag}\` (${
        message.author.id
      })\n**Channel**: ${message.channel} (${
        message.channelId
      })\n**Attachments**: ${message.attachments.map((a) => a.url)}`
    );
  } else {
    Embed.setDescription(
      `**Sent By**: \`${message.author.tag}\` (${message.author.id})\n**Channel**: ${message.channel} (${message.channelId})`
    );
  }

  (client.channels.cache.get(data.Channel) as TextBasedChannel).send({
    embeds: [Embed],
  });
});
