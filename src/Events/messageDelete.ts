import messageLogs from '../utils/models/messageLogs';
import { EmbedBuilder, TextBasedChannel } from 'discord.js';
import { Event } from '../structures/Event';
import { getLink } from '../utils/functions/getLink';
import { client } from '..';

export default new Event('messageDelete', async (message) => {
  if (message.author.bot || !message.guild) return;

  const data = await messageLogs.findOne({
    Guild: message.guildId,
    Toggled: true,
  });
  if (!data || !data?.Channel) return;

  const Embed = new EmbedBuilder()
    .setTitle('📕 Message Deleted')
    .setColor('#000000')
    .setFooter({ text: `Message ID: ${message.id}` })
    .setTimestamp();

  if (message.attachments.size >= 1) {
    Embed.setDescription(
      `**Sent By**: \`${message.author.tag}\` (${
        message.author.id
      })\n**Channel**: ${message.channel} (${
        message.channelId
      })\n**Content**: ${
        message.content.length > 2048
          ? `${message.content.slice(0, 2048)}...`
          : message.content || 'None'
      }\n**Attachments**: ${message.attachments.map((a) => a.url)}`
    );
  } else {
    Embed.setDescription(
      `**Sent By**: \`${message.author.tag}\` (${
        message.author.id
      })\n**Channel**: ${message.channel} (${
        message.channelId
      })\n**Content**: ${
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
