import Discord from 'discord.js';
import { client } from '..';
import { Event } from '../structures/Event';

export default new Event('guildCreate', async (guild) => {
  const embed = new Discord.MessageEmbed()
    .setTitle(':pray: Thank you for inviting me!')
    .setDescription('** **')
    .setColor('#2F3136')
    .addFields([
      {
        name: ':robot: About Mango:',
        value:
          "Mango is focused on efficiency and performance. It's designed to be an easy-to-use and user-friendly bot to provide you with the best experience. We aim to make it more and more comfortable for you to use our Services and we welcome any suggestions from you in our [Discord server](https://discord.gg/B8Fs6Qe6Eq).",
      },
      {
        name: ':sneezing_face: Ask for support:',
        value: '[Join our Discord server!](https://discord.gg/B8Fs6Qe6Eq)',
      },
    ])
    .setFooter({
      text: `Mango Bot`,
      iconURL: client.user.defaultAvatarURL,
    });

  const chats = guild.channels.cache.find(
    (channel) =>
      channel.name === 'staff-chat' ||
      channel.name === 'bot-commands' ||
      channel.name === 'commands'
  );

  const channel = chats ? chats : guild.systemChannel;

  (channel as Discord.TextBasedChannel)?.send({ embeds: [embed] });
});
