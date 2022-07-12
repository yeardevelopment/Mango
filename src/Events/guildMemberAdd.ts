import db from '../utils/models/welcomeMessages';
import configDB from '../utils/models/config';
import { MessageAttachment, MessageEmbed, TextBasedChannel } from 'discord.js';
import { Event } from '../structures/Event';
import { client } from '..';

export default new Event('guildMemberAdd', async (member) => {
  const config = await configDB.findOne({ Guild: member.guild.id });
  if (!config || !config.WelcomeChannel) return;

  const data = await db.findOne({ Guild: member.guild.id });
  if (!data) return;

  if (data.Image) {
    (client.channels.cache.get(config.WelcomeChannel) as TextBasedChannel).send(
      {
        content: data.Text.replace(/@/g, `<@${member.id}>`),
        files: [],
      }
    );
  } else {
    (client.channels.cache.get(config.WelcomeChannel) as TextBasedChannel).send(
      {
        content: data.Text.replace(/@/g, `<@${member.id}>`),
      }
    );
  }
});
