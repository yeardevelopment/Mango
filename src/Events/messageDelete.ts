import db from '../utils/models/messageLogs';
import { MessageEmbed, TextBasedChannel } from 'discord.js';
import { Event } from '../structures/Event';
import { getLink } from '../utils/functions/getLink';
import { client } from '..';

export default new Event('messageDelete', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const data = await db.findOne({ Guild: message.guild.id });
  if (!data) return;

  const Embed = new MessageEmbed()
    .setTitle('📕 Message Deleted')
    .setColor('#000000')
    .setFooter({ text: `Message ID: ${message.id}` })
    .setTimestamp();

  if (message.attachments.size >= 1) {
    Embed.setDescription(
      `**Sent By:** \`${message.author.tag}\` (${
        message.author.id
      })\n**Channel:** ${message.channel} (${
        message.channel.id
      })\n**Content:** ${
        message.content.length > 2048
          ? `${message.content.slice(0, 2048)}...`
          : message.content || 'None'
      }\n**Attachments:** ${message.attachments.map((a) => a.url)}`
    );
  } else {
    Embed.setDescription(
      `**Sent By:** \`${message.author.tag}\` (${
        message.author.id
      })\n**Channel:** ${message.channel} (${
        message.channel.id
      })\n**Content:** ${
        message.content.length > 2048
          ? `${message.content.slice(0, 2048)}...`
          : message.content || 'None'
      }`
    );
  }

  (client.channels.cache.get(data.Channel) as TextBasedChannel).send({
    embeds: [Embed],
  });
});
