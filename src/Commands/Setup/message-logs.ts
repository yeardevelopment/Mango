import { Command } from '../../structures/Command';
import { GuildMember } from 'discord.js';
import db from '../../utils/models/messageLogs';
import { MongooseError } from 'mongoose';

export default new Command({
  name: 'message-logs',
  description: 'Logs deleted and edited messages to a channel',
  options: [
    {
      name: 'enable',
      description: 'Enables the logging of deleted and edited messages',
      type: 'SUB_COMMAND',
    },
    {
      name: 'disable',
      description: 'Disables the logging of deleted and edited messages',
      type: 'SUB_COMMAND',
    },
  ],
  timeout: 10000,
  run: async ({ interaction, args }) => {
    switch (args.getSubcommand()) {
      case 'enable': {
        const channel = args.getChannel('channel') || interaction.channel;

        db.findOne(
          { Guild: interaction.guild.id },
          async (error: MongooseError, data) => {
            if (error) return console.error(error);
            if (data) data.delete();
            new db({
              Guild: interaction.guild.id,
              Channel: channel.id,
            }).save();
            interaction.reply({
              content: `Set message logging channel to ${channel}.`,
            });
          }
        );

        break;
      }
      case 'disable': {
        await db
          .findOne({ guild: interaction.guild.id }, async (error, data) => {
            if (!data)
              return interaction.reply({
                content:
                  '⚠️ Message logging system is not enabled in this server.',
                ephemeral: true,
              });
            await db.findOneAndDelete({ guild: interaction.guild.id });
            interaction.reply({
              content: 'Successfully disabled message logging.',
            });
          })
          .clone();

        break;
      }
    }
  },
});
