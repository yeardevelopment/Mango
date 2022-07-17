import db from '../utils/models/welcomeMessages';
import { MessageAttachment, MessageEmbed, TextBasedChannel } from 'discord.js';
import { Event } from '../structures/Event';
import { client } from '..';

export default new Event('guildMemberAdd', async (member) => {
  const data = await db.findOne({ Guild: member.guild.id, Toggled: true });
  if (!data || !data.Channel || !data.Text) return;
  if (data.Image) {
    (client.channels.cache.get(data.Channel) as TextBasedChannel)?.send({
      content: data.Text.replace(/@/g, `<@${member.id}>`),
      // files: [
      //   {
      //     attachment: image,
      //   },
      // ],
    });
  } else {
    (client.channels.cache.get(data.Channel) as TextBasedChannel)?.send({
      content: data.Text.replace(/@/g, `<@${member.id}>`),
    });
  }
});
