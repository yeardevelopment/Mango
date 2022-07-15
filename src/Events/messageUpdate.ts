import messageLogs from '../utils/models/messageLogs';
import { MessageEmbed, TextBasedChannel } from 'discord.js';
import { Event } from '../structures/Event';
import { getLink } from '../utils/functions/getLink';
import { client } from '..';

export default new Event('messageUpdate', async (oldMessage, newMessage) => {
  if (oldMessage.content === newMessage.content) return;
  if (oldMessage.author.bot || !oldMessage.guild) return;

  const data = await messageLogs.findOne({
    Guild: oldMessage.guild.id,
    Toggled: true,
  });
  if (!data || !data.Channel) return;

  (
    client.channels.cache.get(data.Channel) as TextBasedChannel
  ).send({
    embeds: [
      new MessageEmbed()
        .setTitle('📘 Message Edited')
        .setURL(getLink(newMessage))
        .setDescription(
          `**Edited By**: \`${newMessage.author.tag}\` (${
            newMessage.author.id
          })\n**Channel**: ${newMessage.channel} (${
            newMessage.channel.id
          })\n**Before**: ${
            oldMessage.content.length > 1024
              ? `${oldMessage.content.slice(0, 1024)}...`
              : oldMessage.content
          }\n**After**: ${
            newMessage.content.length > 1024
              ? `${newMessage.content.slice(0, 1024)}...`
              : newMessage.content
          }`
        )
        .setColor('GREEN')
        .setFooter({ text: `Message ID: ${newMessage.id}` })
        .setTimestamp(),
    ],
  });
});
