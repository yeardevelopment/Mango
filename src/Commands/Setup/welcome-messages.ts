import { Command } from '../../structures/Command';
import { GuildMember, MessageEmbed } from 'discord.js';
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
    // {
    //   name: 'image',
    //   type: 'SUB_COMMAND',
    //   description: 'Enables/disables the welcome image in this server',
    // },
    {
      name: 'channel',
      description:
        'Sets the channel that will be used for sending welcome messages',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'channel',
          description: 'Channel to be used for for sending welcome messages',
          channelTypes: ['GUILD_TEXT'],
          type: 'CHANNEL',
          required: false,
        },
      ],
    },
    {
      name: 'settings',
      description:
        'Displays the settings of the welcome system for this server.',
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
          await db.findOneAndUpdate(
            {
              Guild: interaction.guild.id,
            },
            { Text: message }
          );
        } else {
          await db.create({ Guild: interaction.guild.id, Text: message });
        }
        interaction.reply({
          content:
            '<:success:996733680422752347> Successfully updated the welcome message in this server.',
        });
        break;
      }

      case 'channel': {
        const channel = args.getChannel('channel');
        const isChannel = channel ? channel.id : '';
        const data = await db.findOne({ Guild: interaction.guild.id });
        if (data) {
          await db.findOneAndUpdate(
            {
              Guild: interaction.guild.id,
            },
            { Channel: isChannel }
          );
        } else {
          await db.create({ Guild: interaction.guild.id, Channel: isChannel });
        }
        interaction.reply({
          content:
            '<:success:996733680422752347> Successfully updated the welcome message in this server.',
        });
        break;
      }

      case 'image': {
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

      case 'settings': {
        const data = await db.findOne({ Guild: interaction.guild.id });

        if (data) {
          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setTitle('Welcome System | Settings')
                .setColor('#ea664b')
                .setDescription(
                  `${
                    data.Toggled
                      ? '<:on:997453570188259369> System is __enabled__.'
                      : '<:off:997453568908988507> System is __disabled__.'
                  }\n${
                    data.Channel
                      ? `<:on:997453570188259369> Channel set to <#${data.Channel}>.`
                      : '<:off:997453568908988507> Channel is unset.'
                  }\n${
                    data.Text
                      ? `<:on:997453570188259369> Message set to \`${data.Text}\`.`
                      : '<:off:997453568908988507> Message is unset.'
                  }`
                ),
            ],
          });
        } else {
          await db.create({
            Guild: interaction.guild.id,
          });

          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setTitle('Welcome System | Settings')
                .setColor('#ea664b')
                .setDescription(
                  `${
                    data.Toggled
                      ? '<:on:997453570188259369> System is __enabled__.'
                      : '<:off:997453568908988507> System is __disabled__.'
                  }\n${
                    data.Channel
                      ? `<:on:997453570188259369> Channel set to <#${data.Channel}>.`
                      : '<:off:997453568908988507> Channel is unset.'
                  }\n${
                    data.Text
                      ? `<:on:997453570188259369> Message set to \`${data.Text}\`.`
                      : '<:off:997453568908988507> Message is unset.'
                  }`
                ),
            ],
          });
        }
      }
    }
  },
});
