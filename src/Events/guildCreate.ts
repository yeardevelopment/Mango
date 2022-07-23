import Discord, {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { client } from '..';
import { Event } from '../structures/Event';
import db from '../utils/models/config';

export default new Event('guildCreate', async (guild) => {
  guild.members.me.setNickname('Mango');
  const chats = guild.channels.cache.find(
    (channel) =>
      channel.name.includes('staff-chat') ||
      channel.name === 'bot-commands' ||
      channel.name === 'commands'
  );

  const channel = chats ? chats : guild.systemChannel;

  (channel as Discord.TextBasedChannel)?.send({
    embeds: [
      new Discord.EmbedBuilder()
        .setTitle(':pray: Thank you for inviting me!')
        .setDescription('\u200B')
        .setColor('#ea664b')
        .addFields([
          {
            name: ':robot: About Mango:',
            value:
              "Mango is focused on efficiency and performance. It's designed to be an easy-to-use and user-friendly bot to provide you with the best experience. We aim to make it more and more comfortable for you to use our Services and we welcome any suggestions from you in our [Discord server](https://discord.gg/B8Fs6Qe6Eq).\n\n**It is highly recommended to set up the bot now using the `/set` command.**",
          },
        ])
        .setFooter({
          text: client.user.username,
          iconURL: client.user.defaultAvatarURL,
        }),
    ],
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
