import { Command } from '../../structures/Command';
import * as Discord from 'discord.js';

export default new Command({
  name: 'ping',
  description: '',
  run: async ({ interaction, client }) => {
    await interaction
      .reply({ content: `Calculating ping...` })
      .then((resultMessage) => {
        const ping = Date.now() - interaction.createdTimestamp;
        const embed = new Discord.MessageEmbed()
          .setTitle('Pong!')
          .setAuthor({
            name: `${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setDescription(
            `:ping_pong: Bot Latency is ${ping} ms\n:hourglass: API Latency is ${Math.round(
              client.ws.ping
            )} ms`
          )
          .setFooter({
            text: `${interaction.guild.name}`,
            iconURL: interaction.guild.iconURL({ dynamic: true }),
          })
          .setColor('#2F3136');
        interaction.editReply({
          content: `\u200B`,
          embeds: [embed],
        });
      });
  },
});
