import { Command } from '../../structures/Command';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  TextBasedChannel,
} from 'discord.js';
import db from '../../utils/models/verification';
import ms from 'ms';

export default new Command({
  name: 'verification',
  description: 'Verification system management',
  options: [
    {
      name: 'panel',
      description:
        'Sends verification panel that can be used by people to verify themselves',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'channel',
          description: 'Channel the panel to be sent to',
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [ChannelType.GuildText],
          required: true,
        },
        {
          name: 'title',
          description: 'Optional title for the panel embed',
          type: ApplicationCommandOptionType.String,
          required: false,
          min_length: 1,
          max_length: 256,
        },
        {
          name: 'description',
          description: 'Optional description for the panel embed',
          type: ApplicationCommandOptionType.String,
          required: false,
          min_length: 1,
          max_length: 4096,
        },
      ],
    },
    {
      name: 'age',
      description:
        'The minimum age of an account for it to be eligible for verification',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'days',
          description:
            'The minimum age required in days; 0 disables the age requirement',
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
      ],
    },
    {
      name: 'role',
      description:
        'Role that will be given to members after they passed the verification',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'role',
          description:
            'Role that will be given to members after they passed the verification',
          type: ApplicationCommandOptionType.Role,
          required: false,
        },
      ],
    },
    {
      name: 'toggle',
      description: 'Enables/disables the verification system in this server',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'settings',
      description:
        'Displays the settings of the verification system for this server.',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  permissions: 'ManageGuild',
  timeout: 10000,
  run: async ({ interaction, args }) => {
    switch (args.getSubcommand()) {
      case 'panel': {
        const data = await db.findOne({
          Guild: interaction.guildId,
          Toggled: true,
        });
        if (!data || !data.Toggled)
          return interaction.reply({
            content:
              '⚠️ You need to enable the verification system with `/verification toggle`.',
            ephemeral: true,
          });

        const channel = args.getChannel('channel');
        const title = args.getString('title') || 'Verification System';
        const description =
          args.getString('description') ||
          'Verify yourself in order to gain full access to the server.\nStart the verification process by clicking the button below.';

        (channel as TextBasedChannel).send({
          embeds: [
            new EmbedBuilder()
              .setTitle(title)
              .setDescription(description)
              .setFooter({
                text: 'You will need to have your direct messages enabled.',
              })
              .setColor('#ea664b'),
          ],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel('Verify')
                .setEmoji({ name: 'puzzle', id: '996733683593662485' })
                .setStyle(ButtonStyle.Primary)
                .setCustomId('verify')
            ) as ActionRowBuilder<ButtonBuilder>,
          ],
        });
        interaction.reply({
          content: `Sent the verification panel to ${channel}.`,
        });
        break;
      }
      case 'age': {
        const age = args.getInteger('days');
        const days = age * 24 * 60 * 60 * 1000;

        const data = await db.findOne({ Guild: interaction.guildId });
        if (data) {
          await db.findOneAndUpdate(
            {
              Guild: interaction.guildId,
            },
            { $set: { Age: days } }
          );
        } else {
          await db.create({ Guild: interaction.guildId, Age: days });
        }
        interaction.reply({
          content:
            '<:success:996733680422752347> Successfully updated the verification system settings in this server.',
        });
        break;
      }
      case 'role': {
        let role = args.getRole('role');
        const isRole = role ? role.id : '';

        const data = await db.findOne({ Guild: interaction.guildId });
        if (data) {
          await db.findOneAndUpdate(
            {
              Guild: interaction.guildId,
            },
            {
              $set: { Role: isRole },
            }
          );
        } else {
          await db.create({ Guild: interaction.guildId, Role: isRole });
        }
        interaction.reply({
          content: `<:success:996733680422752347> Successfully updated the verification system settings in this server.`,
        });
        break;
      }
      case 'toggle': {
        const data = await db.findOne({ Guild: interaction.guildId });
        if (data && data.Toggled) {
          await db.findOneAndUpdate(
            { Guild: interaction.guildId },
            { $set: { Toggled: false } }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully disabled the verification system in this server.',
          });
        } else if (data && data.Toggled === false) {
          await db.findOneAndUpdate(
            { Guild: interaction.guildId },
            { $set: { Toggled: true } }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled the verification system in this server.',
          });
        } else {
          await db.create({
            Guild: interaction.guildId,
            Toggled: true,
          });
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled the verification system in this server.',
          });
        }
        break;
      }

      case 'settings': {
        const data = await db.findOne({ Guild: interaction.guildId });

        if (data) {
          interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Verification System | Settings')
                .setColor('#ea664b')
                .setDescription(
                  `${
                    data.Toggled
                      ? '<:on:997453570188259369> System is __enabled__.'
                      : '<:off:997453568908988507> System is __disabled__.'
                  }\n${
                    data.Age > 0
                      ? `<:on:997453570188259369> Minimum account age set to __${ms(
                          data.Age,
                          { long: true }
                        )}__.`
                      : '<:off:997453568908988507> Minimum account age is unset.'
                  }\n${
                    data.Role
                      ? `<:on:997453570188259369> Role set to <@&${data.Role}>.`
                      : '<:off:997453568908988507> No role set.'
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
                .setTitle('Verification System | Settings')
                .setColor('#ea664b')
                .setDescription(
                  `${
                    data.Toggled
                      ? '<:on:997453570188259369> System is __enabled__.'
                      : '<:off:997453568908988507> System is __disabled__.'
                  }\n${
                    data.Age > 0
                      ? `<:on:997453570188259369> Minimum account age set to __${ms(
                          data.Age,
                          { long: true }
                        )}__.`
                      : '<:off:997453568908988507> Minimum account age is unset.'
                  }\n<:verified:997446146282758144> ${
                    data.Role ? `Role set to <@&${data.Role}>.` : 'No role set.'
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
