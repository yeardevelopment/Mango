import messageLogs from '../utils/models/messageLogs';
import { EmbedBuilder, TextBasedChannel } from 'discord.js';
import { Event } from '../structures/Event';
import { getLink } from '../utils/functions/getLink';
import { client } from '..';

export default new Event('messageUpdate', async (oldMessage, newMessage) => {
  if (oldMessage.content === newMessage.content) return;
  if (oldMessage.author.bot || !oldMessage.guild) return;

  const data = await messageLogs.findOne({
    Guild: oldMessage.guildId,
    Toggled: true,
  });
  if (!data || !data?.Channel) return;

  (client.channels.cache.get(data.Channel) as TextBasedChannel).send({
    embeds: [
      new EmbedBuilder()
        .setTitle('📘 Message Edited')
        .setURL(getLink({ value: newMessage }))
        .setDescription(
          `**Edited By**: \`${newMessage.author.tag}\` (${newMessage.author.id})\n**Channel**: ${newMessage.channel} (${newMessage.channelId})`
        )
        .addFields([
          {
            name: 'Before:',
            value: `\`\`\`${
              oldMessage.content.length > 1015
                ? `${oldMessage.content.slice(0, 1015)}...`
                : oldMessage.content
            }\`\`\``,
          },
          {
            name: 'After:',
            value: `\`\`\`${
              newMessage.content.length > 1015
                ? `${newMessage.content.slice(0, 1015)}...`
                : newMessage.content
            }\`\`\``,
          },
        ])
        .setColor('#53a9e9')
        .setFooter({ text: `Message ID: ${newMessage.id}` })
        .setTimestamp(),
    ],
  });
});
