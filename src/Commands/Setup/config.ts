import { EmbedBuilder } from 'discord.js';
import { Command } from '../../structures/Command';
import db from '../../utils/models/config';

export default new Command({
  name: 'settings',
  description: "Displays the bot's configuration for this server",
  permissions: 'ManageGuild',
  timeout: 10000,
  run: async ({ interaction }) => {
    const data = await db.findOne({ Guild: interaction.guildId });

    const Embed = new EmbedBuilder()
      .setTitle('Settings')
      .setDescription(
        `🔇 **Mute Role**: ${
          data.MuteRole ? `<@&${data.MuteRole}>` : '*not set*'
        }`
      )
      .setColor('#ea664b')
      .setFooter({ text: 'Use /set command to change the settings.' });

    interaction.reply({
      embeds: [Embed],
    });
  },
});
