import { Command } from '../../structures/Command';
import { GuildMember } from 'discord.js';
import db from '../../utils/models/welcomeMessages';
import { MongooseError } from 'mongoose';

export default new Command({
  name: 'welcome',
  description: 'Welcomes new members to the guild',
  options: [
    {
      name: 'enable',
      description:
        'Sets a message to be sent to a channel when a member joins the guild',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'text',
          type: 'STRING',
          description:
            "Text to be sent when a member joins the guild; add '@' to mention the joined member",
          required: true,
        },
        {
          name: 'image',
          type: 'BOOLEAN',
          description: 'Whether to send a welcoming image or not',
          required: true,
        },
      ],
    },
    {
      name: 'disable',
      description:
        'Unsets a message to be sent to a channel when a member joins the guild',
      type: 'SUB_COMMAND',
    },
  ],
  timeout: 10000,
  run: async ({ interaction, args }) => {
    switch (args.getSubcommand()) {
      case 'enable': {
        const text = args.getString('text');
        const image = args.getBoolean('image');

        db.findOne(
          { Guild: interaction.guild.id },
          async (error: MongooseError, data) => {
            if (error) return console.error(error);
            if (data) data.delete();
            new db({
              Guild: interaction.guild.id,
              Text: text,
              Image: image,
            }).save();
            interaction.reply({
              content: `Updated the welcome message.`,
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
                  '⚠️ Welcome message system is not enabled in this server.',
                ephemeral: true,
              });
            await db.findOneAndDelete({ guild: interaction.guild.id });
            interaction.reply({
              content: 'Successfully disabled welcome messages.',
            });
          })
          .clone();

        break;
      }
    }
  },
});
