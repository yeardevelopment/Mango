import { Command } from '../../structures/Command';
import { GuildMember } from 'discord.js';
import db from '../../utils/models/welcomeMessages';
import { MongooseError } from 'mongoose';

export default new Command({
  name: 'welcome',
  description: 'Welcomes new members to the guild',
  options: [
    {
      name: 'toggle',
      description: 'Enables/disables welcome messages in this server',
      type: 'SUB_COMMAND',
    },
    {
      name: 'message',
      type: 'SUB_COMMAND',
      description:
        "Text to be sent when a member joins the guild; add '@' to mention the joined member",
      options: [
        {
          name: 'message',
          description:
            "Text to be sent when a member joins the guild; add '@' to mention the joined member",
          type: 'STRING',
          required: true,
        },
      ],
    },
    {
      name: 'image',
      type: 'SUB_COMMAND',
      description: 'Whether to send a welcoming image or not',
      options: [
        {
          name: 'image',
          description: 'Whether to send a welcoming image or not',
          type: 'BOOLEAN',
          required: true,
        },
      ],
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
              '<:success:996733680422752347> Successfully disabled welcome messages in this server.',
          });
        } else if (data && data.Toggled === false) {
          await db.findOneAndUpdate(
            { Guild: interaction.guild.id },
            { Toggled: true }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled welcome messages in this server.',
          });
        } else {
          await db.create({
            Guild: interaction.guild.id,
            Toggled: true,
          });
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled welcome messages in this server.',
          });
        }
        break;
      }

      case 'message': {
        const message = args.getString('message');
        const data = await db.findOne({ Guild: interaction.guild.id });
        if (data) {
          await db.findOneAndUpdate({
            Guild: interaction.guild.id,
            Text: message,
          });
        } else {
          await db.create({ Guild: interaction.guild.id, Text: message });
        }
        interaction.reply({
          content:
            '<:success:996733680422752347> Successfully updated the welcome message in this server.',
        });
        break;
      }

      case 'image': {
        const boolean = args.getBoolean('image');
        const data = await db.findOne({ Guild: interaction.guild.id });
        if (data && data.Image) {
          await db.findOneAndUpdate(
            { Guild: interaction.guild.id },
            { Image: false }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully disabled the welcome image in this server.',
          });
        } else if (data && data.Image === false) {
          await db.findOneAndUpdate(
            { Guild: interaction.guild.id },
            { Image: true }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled the welcome image in this server.',
          });
        } else {
          await db.create({
            Guild: interaction.guild.id,
            Image: true,
          });
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled the welcome image in this server.',
          });
        }
        break;
      }
    }
  },
});
