import { MessageEmbed } from 'discord.js';
import { Command } from '../../structures/Command';
import db from '../../utils/models/config';

export default new Command({
  name: 'settings',
  description: "Displays the bot's configuration for this server",
  timeout: 10000,
  run: async ({ interaction }) => {
    const data = await db.findOne({ Guild: interaction.guild.id });

    const Embed = new MessageEmbed()
      .setTitle('Settings')
      .setDescription(
        `🔇 **Mute Role**: ${
          data.MuteRole ? `<@&${data.MuteRole}>` : '*not set*'
        }\n🧑‍💼 **Staff Role**: ${
          data.StaffRole ? `<@&${data.StaffRole}>` : '*not set*'
        }\n👋 **Welcome Channel**: ${
          data.WelcomeChannel ? `<#${data.WelcomeChannel}>` : '*not set*'
        }\n🔨 **Moderation Logs Channel**: ${
          data.ModerationLogsChannel
            ? `<#${data.ModerationLogsChannel}>`
            : '*not set*'
        }\n💬 **Message Logs Channel**: ${
          data.MessageLogsChannel
            ? `<#${data.MessageLogsChannel}>`
            : '*not set*'
        }\n🎫 **Ticket Logs Channel**: ${
          data.TicketLogsChannel ? `<#${data.TicketLogsChannel}>` : '*not set*'
        }\n🎫 **Tickets Category**: ${
          data.TicketsCategory ? `<#${data.TicketsCategory}>` : '*not set*'
        }`
      )
      .setColor('#2F3136')
      .setFooter({ text: 'Use /set command to change the settings.' });

    interaction.reply({
      embeds: [Embed],
    });
  },
});
