import { MessageEmbed } from 'discord.js';
import { Command } from '../../structures/Command';
import db from '../../utils/models/config';

export default new Command({
  name: 'config',
  description: "Displays the bot's configuration for this server",
  timeout: 10000,
  run: async ({ interaction }) => {
    const data = await db.findOne({ Guild: interaction.guild.id });

    const Embed = new MessageEmbed()
      .setTitle('Configuration')
      .setDescription(
        `🔇 **Mute Role**: ${
          data.MuteRole ? `<@&${data.MuteRole}>` : '*not set*'
        }\n👋 **Welcome Channel**: ${
          data.WelcomeChannel ? `<#${data.WelcomeChannel}>` : '*not set*'
        }\n💬 **Message Logging Channel**: ${
          data.MessageLogsChannel
            ? `<#${data.MessageLogsChannel}>`
            : '*not set*'
        }`
      )
      .setColor('#2F3136')
      .setFooter({ text: 'Use /set command to change the configuration.' });

    interaction.reply({
      embeds: [Embed],
    });
  },
});
