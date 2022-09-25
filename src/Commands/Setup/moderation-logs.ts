import { Command } from '../../structures/Command';
import db from '../../utils/models/modLogs';
import {
  ApplicationCommandOptionType,
  ChannelType,
  EmbedBuilder,
} from 'discord.js';

export default new Command({
  name: 'moderation-logs',
  description: 'Moderation Logging System Command',
  permissions: 'ManageGuild',
  options: [
    {
      name: 'toggle',
      description:
        'Enables/disables the moderation logging system in this server',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'channel',
      description:
        'Sets the channel that will be used for logging moderation actions this server',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'channel',
          description:
            'Channel to be used for for logging moderation actions in this server',
          channelTypes: [ChannelType.GuildText],
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
      ],
    },
    {
      name: 'settings',
      description:
        'Displays the settings of the moderation logging system for this server.',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  timeout: 5000,
  run: async ({ interaction, args }) => {
    switch (args.getSubcommand()) {
      case 'toggle': {
        const data = await db.findOne({ Guild: interaction.guildId });
        if (data && data.Toggled) {
          await db.findOneAndUpdate(
            { Guild: interaction.guildId },
            { $set: { Toggled: false } }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully disabled moderation logs in this server.',
          });
        } else if (data && data.Toggled === false) {
          await db.findOneAndUpdate(
            { Guild: interaction.guildId },
            { $set: { Toggled: true } }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled moderation logs in this server.',
          });
        } else {
          await db.create({
            Guild: interaction.guildId,
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
        const data = await db.findOne({ Guild: interaction.guildId });
        if (data) {
          await db.findOneAndUpdate(
            {
              Guild: interaction.guildId,
            },
            { $set: { Channel: isChannel } }
          );
        } else {
          await db.create({ Guild: interaction.guildId, Channel: isChannel });
        }
        interaction.reply({
          content:
            '<:success:996733680422752347> Successfully updated the moderation logging settings in this server.',
        });
        break;
      }

      case 'settings': {
        const data = await db.findOne({ Guild: interaction.guildId });

        if (data) {
          interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Moderation Logging System | Settings')
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
                  }`
                ),
            ],
          });
        } else {
          await db.create({
            Guild: interaction.guildId,
          });

          interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Moderation Logging System | Settings')
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
                  }`
                ),
            ],
          });
        }
        break;
      }
    }
  },
});
