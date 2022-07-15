import { Command } from '../../structures/Command';
import db from '../../utils/models/modLogs';
import { MongooseError } from 'mongoose';
import { MessageEmbed } from 'discord.js';

export default new Command({
  name: 'moderation-logs',
  description: 'Logs moderation actions',
  options: [
    {
      name: 'toggle',
      description:
        'Enables/disables the moderation logging system in this server',
      type: 'SUB_COMMAND',
    },
    {
      name: 'channel',
      description:
        'Sets the channel that will be used for logging moderation actions this server',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'channel',
          description:
            'Channel to be used for for logging moderation actions in this server',
          channelTypes: ['GUILD_TEXT'],
          type: 'CHANNEL',
          required: false,
        },
      ],
    },
    {
      name: 'settings',
      description:
        'Displays the settings of the moderation logging system for this server.',
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
              '<:success:996733680422752347> Successfully disabled moderation logs in this server.',
          });
        } else if (data && data.Toggled === false) {
          await db.findOneAndUpdate(
            { Guild: interaction.guild.id },
            { Toggled: true }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled moderation logs in this server.',
          });
        } else {
          await db.create({
            Guild: interaction.guild.id,
            Toggled: true,
          });
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled moderation logs in this server.',
          });
        }
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
            '<:success:996733680422752347> Successfully updated the moderation logging settings in this server.',
        });
        break;
      }

      case 'settings': {
        const data = await db.findOne({ Guild: interaction.guild.id });

        if (data) {
          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setTitle('Moderation Logging System | Settings')
                .setColor('#2F3136')
                .setDescription(
                  `${
                    data.Toggled
                      ? '<:on:997453570188259369> System is __enabled__.'
                      : '<:off:997453568908988507> System is __disabled__.'
                  }\n${
                    data.Channel
                      ? `<:on:997453570188259369> Channel set to <#${data.Channel}>.`
                      : '<:off:997453568908988507> Channel is unset.'
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
                .setTitle('Moderation Logging System | Settings')
                .setColor('#2F3136')
                .setDescription(
                  `${
                    data.Toggled
                      ? '<:on:997453570188259369> System is __enabled__.'
                      : '<:off:997453568908988507> System is __disabled__.'
                  }\n${
                    data.Channel
                      ? `<:on:997453570188259369> Channel set to <#${data.Channel}>.`
                      : '<:off:997453568908988507> Channel is unset.'
                  }`
                ),
            ],
          });
        }
      }
    }
  },
});
