import { Command } from '../../structures/Command';
import {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  TextBasedChannel,
} from 'discord.js';
import db from '../../utils/models/ticket';
import { MongooseError } from 'mongoose';

export default new Command({
  name: 'ticket',
  description: 'Ticket system management',
  options: [
    {
      name: 'panel',
      description: 'Sends ticket panel that can be used to create tickets',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'channel',
          description: 'Channel the panel to be sent to',
          type: 'CHANNEL',
          channelTypes: ['GUILD_TEXT'],
          required: true,
        },
        {
          name: 'title',
          description: 'Optional title for the panel embed',
          type: 'STRING',
          required: false,
        },
        {
          name: 'description',
          description: 'Optional description for the panel embed',
          type: 'STRING',
          required: false,
        },
      ],
    },
    {
      name: 'logs',
      description:
        'Sets the channel that will be used for logging closed tickets information',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'channel',
          description:
            'Channel to be used for logging closed tickets information',
          channelTypes: ['GUILD_TEXT'],
          type: 'CHANNEL',
          required: false,
        },
      ],
    },
    {
      name: 'category',
      description: 'Sets the category where opened tickets will appear in',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'category',
          type: 'CHANNEL',
          description: 'Category where opened tickets will appear in',
          channelTypes: ['GUILD_CATEGORY'],
          required: false,
        },
      ],
    },
    {
      name: 'toggle',
      description: 'Enables/disables the ticket system in this server',
      type: 'SUB_COMMAND',
    },
    {
      name: 'settings',
      description:
        'Displays the settings of the ticket system for this server.',
      type: 'SUB_COMMAND',
    },
  ],
  timeout: 10000,
  run: async ({ interaction, args }) => {
    switch (args.getSubcommand()) {
      case 'panel': {
        const data = await db.findOne({
          Guild: interaction.guild.id,
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
            new MessageEmbed()
              .setTitle(title)
              .setDescription(description)
              .setColor('#ea664b'),
          ],
          components: [
            new MessageActionRow().setComponents(
              new MessageButton()
                .setLabel('Create')
                .setEmoji('997205867646685284')
                .setStyle('PRIMARY')
                .setCustomId('ticket')
            ),
          ],
        });
        interaction.reply({ content: `Sent the ticket panel to ${channel}.` });
        break;
      }
      case 'toggle': {
        const data = await db.findOne({ Guild: interaction.guild.id });
        if (data && data.Toggled) {
          await db.findOneAndUpdate(
            { Guild: interaction.guild.id },
            { Toggled: false }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully disabled the ticket system in this server.',
          });
        } else if (data && data.Toggled === false) {
          await db.findOneAndUpdate(
            { Guild: interaction.guild.id },
            { Toggled: true }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled the ticket system in this server.',
          });
        } else {
          await db.create({
            Guild: interaction.guild.id,
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

        const data = await db.findOne({ Guild: interaction.guild.id });
        if (data) {
          await db.findOneAndUpdate(
            {
              Guild: interaction.guild.id,
            },
            {
              LogsChannel: isChannel,
            }
          );
        } else {
          await db.create({
            Guild: interaction.guild.id,
            LogsChannel: isChannel,
          });
        }
        interaction.reply({
          content: `<:success:996733680422752347> Successfully updated the ticket system settings in this server.`,
        });
        break;
      }

      case 'category': {
        let channel = args.getChannel('category');
        const isChannel = channel ? channel.id : '';

        const data = await db.findOne({ Guild: interaction.guild.id });
        if (data) {
          await db.findOneAndUpdate(
            {
              Guild: interaction.guild.id,
            },
            {
              Category: isChannel,
            }
          );
        } else {
          await db.create({
            Guild: interaction.guild.id,
            Category: isChannel,
          });
        }
        interaction.reply({
          content: `<:success:996733680422752347> Successfully updated the ticket system settings in this server.`,
        });
        break;
      }

      case 'settings': {
        const data = await db.findOne({ Guild: interaction.guild.id });

        if (data) {
          interaction.reply({
            embeds: [
              new MessageEmbed()
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
            Guild: interaction.guild.id,
          });

          interaction.reply({
            embeds: [
              new MessageEmbed()
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
