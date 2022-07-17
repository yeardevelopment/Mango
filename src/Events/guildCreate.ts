import Discord, { MessageActionRow, MessageButton } from 'discord.js';
import { client } from '..';
import { Event } from '../structures/Event';
import db from '../utils/models/config';

export default new Event('guildCreate', async (guild) => {
  guild.me.setNickname('Mango');
  const chats = guild.channels.cache.find(
    (channel) =>
      channel.name.includes('staff-chat') ||
      channel.name === 'bot-commands' ||
      channel.name === 'commands'
  );

  const channel = chats ? chats : guild.systemChannel;

  (channel as Discord.TextBasedChannel)?.send({
    embeds: [
      new Discord.MessageEmbed()
        .setTitle(':pray: Thank you for inviting me!')
        .setDescription('\u200B')
        .setColor('#ea664b')
        .addField(
          ':robot: About Mango:',
          "Mango is focused on efficiency and performance. It's designed to be an easy-to-use and user-friendly bot to provide you with the best experience. We aim to make it more and more comfortable for you to use our Services and we welcome any suggestions from you in our [Discord server](https://discord.gg/B8Fs6Qe6Eq).\n\n**It's highly recommended to set up the bot now using the `/set` command.**"
        )
        .setFooter({
          text: client.user.username,
          iconURL: client.user.defaultAvatarURL,
        }),
    ],
    components: [
      new MessageActionRow().addComponents([
        new MessageButton()
          .setLabel('Support Server')
          .setEmoji('996734485120962591')
          .setStyle('LINK')
          .setURL('https://discord.gg/QeKcwprdCY'),
        new MessageButton()
          .setLabel('Terms & Conditions')
          .setEmoji('996733685313323059')
          .setStyle('LINK')
          .setURL('https://yearcommunity.wixsite.com/main/terms'),
        new MessageButton()
          .setLabel('Privacy Policy')
          .setEmoji('996733682175987723')
          .setStyle('LINK')
          .setURL('https://yearcommunity.wixsite.com/main/privacy'),
      ]),
    ],
  });

  const data = await db.findOne({ Guild: guild.id });
  if (!data)
    await db.create({
      Guild: guild.id,
    });
});
