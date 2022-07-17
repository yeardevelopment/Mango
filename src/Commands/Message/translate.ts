import { Command } from '../../structures/Command';
import Discord from 'discord.js';

export default new Command({
  name: 'ping',
  description: "Calculates the bot's ping along with API Latency",
  timeout: 5000,
  run: async ({ interaction, client }) => {
    await interaction
      .reply({ content: `Calculating ping...` })
      .then((resultMessage) => {
        const ping: number = Date.now() - interaction.createdTimestamp;
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
          .setColor('#ea664b');
        interaction.editReply({
          content: `\u200B`,
          embeds: [embed],
        });
      });
  },
});
