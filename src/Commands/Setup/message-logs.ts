import { Command } from '../../structures/Command';
import { GuildMember } from 'discord.js';
import db from '../../utils/models/messageLogs';
import { MongooseError } from 'mongoose';

export default new Command({
  name: 'message-logs',
  description: 'Logs deleted and edited messages to a channel',
  options: [
    {
      name: 'toggle',
      description:
        'Enables/disables the logging of message edits/deletions in this server',
      type: 'SUB_COMMAND',
    },
  ],
  timeout: 10000,
  run: async ({ interaction, args }) => {
    switch (args.getSubcommand()) {
      case 'toggle': {
        const data = await db.findOne({ Guild: interaction.guild.id });
        if (data && data.Toggled) {
          await db.findOneAndUpdate(
            { Guild: interaction.guild.id },
            { Toggled: false }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully disabled message logging in this server.',
          });
        } else if (data && data.Toggled === false) {
          await db.findOneAndUpdate(
            { Guild: interaction.guild.id },
            { Toggled: true }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled message logging in this server.',
          });
        } else {
          await db.create({
            Guild: interaction.guild.id,
            Toggled: true,
          });
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled message logging in this server.',
          });
        }
        break;
      }
    }
  },
});
