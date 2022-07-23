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
import db from '../../utils/models/ticket';

export default new Command({
  name: 'ticket',
  description: 'Ticket system management',
  options: [
    {
      name: 'panel',
      description: 'Sends ticket panel that can be used to create tickets',
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
      name: 'staff-role',
      description:
        'Sets the role, members of what will be able to manage tickets',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'role',
          type: ApplicationCommandOptionType.Role,
          description: 'Role, members of what will be able to manage tickets',
          required: false,
        },
      ],
    },
    {
      name: 'logs',
      description:
        'Sets the channel that will be used for logging closed tickets information',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'channel',
          description:
            'Channel to be used for logging closed tickets information',
          channelTypes: [ChannelType.GuildText],
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
      ],
    },
    {
      name: 'category',
      description: 'Sets the category where opened tickets will appear in',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'category',
          type: ApplicationCommandOptionType.Channel,
          description: 'Category where opened tickets will appear in',
          channelTypes: [ChannelType.GuildCategory],
          required: false,
        },
      ],
    },
    {
      name: 'toggle',
      description: 'Enables/disables the ticket system in this server',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'settings',
      description:
        'Displays the settings of the ticket system for this server.',
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
              '⚠️ You need to enable the ticket system with `/ticket enable`.',
            ephemeral: true,
          });

        const channel = args.getChannel('channel');
        const description =
          args.getString('description') ||
          'Create a ticket by clicking the button below.';
        const title = args.getString('title') || 'Create a Ticket';

        (channel as TextBasedChannel).send({
          embeds: [
            new EmbedBuilder()
              .setTitle(title)
              .setDescription(description)
              .setColor('#ea664b'),
          ],
          components: [
            new ActionRowBuilder().setComponents(
              new ButtonBuilder()
                .setLabel('Create')
                .setEmoji({ name: 'ticket', id: '997205867646685284' })
                .setStyle(ButtonStyle.Primary)
                .setCustomId('ticket')
            ) as ActionRowBuilder<ButtonBuilder>,
          ],
        });
        interaction.reply({ content: `Sent the ticket panel to ${channel}.` });
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
              '<:success:996733680422752347> Successfully disabled the ticket system in this server.',
          });
        } else if (data && data.Toggled === false) {
          await db.findOneAndUpdate(
            { Guild: interaction.guildId },
            { $set: { Toggled: true } }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled the ticket system in this server.',
          });
        } else {
          await db.create({
            Guild: interaction.guildId,
            Toggled: true,
          });
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled the ticket system in this server.',
          });
        }
        break;
      }

      case 'logs': {
        let channel = args.getChannel('channel');
        const isChannel = channel ? channel.id : '';

        const data = await db.findOne({ Guild: interaction.guildId });
        if (data) {
          await db.findOneAndUpdate(
            {
              Guild: interaction.guildId,
            },
            {
              $set: { LogsChannel: isChannel },
            }
          );
        } else {
          await db.create({
            Guild: interaction.guildId,
            LogsChannel: isChannel,
          });
        }
        interaction.reply({
          content: `<:success:996733680422752347> Successfully updated the ticket system settings in this server.`,
        });
        break;
      }

      case 'staff-role': {
        let role = args.getRole('role');
        const isRole = role ? role.id : '';

        const data = await db.findOne({ Guild: interaction.guildId });
        if (data) {
          await db.findOneAndUpdate(
            {
              Guild: interaction.guildId,
            },
            {
              $set: { StaffRole: isRole },
            }
          );
        } else {
          await db.create({ Guild: interaction.guildId, StaffRole: isRole });
        }
        interaction.reply({
          content: `<:success:996733680422752347> Successfully updated the verification system settings in this server.`,
        });
        break;
      }

      case 'category': {
        let channel = args.getChannel('category');
        const isChannel = channel ? channel.id : '';

        const data = await db.findOne({ Guild: interaction.guildId });
        if (data) {
          await db.findOneAndUpdate(
            {
              Guild: interaction.guildId,
            },
            {
              $set: { Category: isChannel },
            }
          );
        } else {
          await db.create({
            Guild: interaction.guildId,
            Category: isChannel,
          });
        }
        interaction.reply({
          content: `<:success:996733680422752347> Successfully updated the ticket system settings in this server.`,
        });
        break;
      }

      case 'settings': {
        const data = await db.findOne({ Guild: interaction.guildId });

        if (data) {
          interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Ticket System | Settings')
                .setColor('#ea664b')
                .setDescription(
                  `${
                    data.Toggled
                      ? '<:on:997453570188259369> System is __enabled__.'
                      : '<:off:997453568908988507> System is __disabled__.'
                  }\n${
                    data.LogsChannel
                      ? `<:on:997453570188259369> Logging channel set to <#${data.LogsChannel}>.`
                      : '<:off:997453568908988507> Logging channel is unset.'
                  }\n${
                    data.Category
                      ? `<:on:997453570188259369> Tickets category set to <#${data.Category}>.`
                      : '<:off:997453568908988507> Tickets category is unset.'
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
                .setTitle('Ticket System | Settings')
                .setColor('#ea664b')
                .setDescription(
                  `${
                    data.Toggled
                      ? '<:on:997453570188259369> System is __enabled__.'
                      : '<:off:997453568908988507> System is __disabled__.'
                  }\n${
                    data.LogsChannel
                      ? `<:on:997453570188259369> Logging channel set to <#${data.LogsChannel}>.`
                      : '<:off:997453568908988507> Logging channel is unset.'
                  }\n${
                    data.Category
                      ? `<:on:997453570188259369> Tickets category set to <#${data.Category}>.`
                      : '<:off:997453568908988507> Tickets category is unset.'
                  }`
                ),
            ],
          });
        }
      }
    }
  },
});
