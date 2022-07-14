import { Command } from '../../structures/Command';
import { GuildMember } from 'discord.js';
import db from '../../utils/models/config';

export default new Command({
  name: 'set',
  description: 'Sets configuration settings for the guild',
  options: [
    {
      name: 'muterole',
      description:
        'Sets the role that will be used for mute command and automatical mutes',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'role',
          type: 'ROLE',
          description: 'Role to be used for mute command and automatical mutes',
          required: true,
        },
      ],
    },
    {
      name: 'staffrole',
      description:
        'Sets the role, members of what will be determined as staff members',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'role',
          type: 'ROLE',
          description:
            'Role, members of what will be determined as staff members',
          required: true,
        },
      ],
    },
    {
      name: 'tickets-category',
      description: 'Sets the category where opened tickets will appear in',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'category',
          type: 'CHANNEL',
          description: 'Category where opened tickets will appear in',
          channelTypes: ['GUILD_CATEGORY'],
          required: true,
        },
      ],
    },
    {
      name: 'ticket-logs-channel',
      description:
        'Sets the channel that will be used for logging closed tickets information',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'channel',
          type: 'CHANNEL',
          description:
            'Channel to be used for logging closed tickets information',
          channelTypes: ['GUILD_TEXT'],
          required: true,
        },
      ],
    },
    {
      name: 'welcome-channel',
      description: 'Sets the channel that will be used for welcome messages',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'channel',
          type: 'CHANNEL',
          description: 'Channel to be used for welcome messages',
          channelTypes: ['GUILD_TEXT'],
          required: true,
        },
      ],
    },
    {
      name: 'message-logs-channel',
      description:
        'Sets the channel that will be used for logging message edits/deletions',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'channel',
          type: 'CHANNEL',
          description: 'Channel to be used for logging message edits/deletions',
          channelTypes: ['GUILD_TEXT'],
          required: true,
        },
      ],
    },
  ],
  timeout: 10000,
  run: async ({ interaction, args }) => {
    switch (args.getSubcommand()) {
      case 'muterole': {
        const role = args.getRole('role');

        await db.findOneAndUpdate(
          { Guild: interaction.guild.id },
          { $set: { MuteRole: role.id } }
        );
        interaction.reply({
          content: `<:success:996733680422752347> Successfully set ${role} as the mute role.`,
          allowedMentions: {
            roles: [],
          },
        });

        break;
      }

      case 'staffrole': {
        const role = args.getRole('role');

        await db.findOneAndUpdate(
          { Guild: interaction.guild.id },
          { $set: { StaffRole: role.id } }
        );
        interaction.reply({
          content: `<:success:996733680422752347> Successfully set ${role} as the staff role.`,
          allowedMentions: {
            roles: [],
          },
        });

        break;
      }

      case 'ticket-logs-channel': {
        const channel = args.getChannel('channel');

        await db.findOneAndUpdate(
          { Guild: interaction.guild.id },
          { $set: { TicketLogsChannel: channel.id } }
        );
        interaction.reply({
          content: `<:success:996733680422752347> Successfully set ${channel} as the tickets logging channel.`,
        });

        break;
      }

      case 'tickets-category': {
        const channel = args.getChannel('category');

        await db.findOneAndUpdate(
          { Guild: interaction.guild.id },
          { $set: { TicketsCategory: channel.id } }
        );
        interaction.reply({
          content: `<:success:996733680422752347> Successfully set ${channel.name} as the category for tickets.`,
        });

        break;
      }

      case 'welcome-channel': {
        const channel = args.getChannel('channel');

        await db.findOneAndUpdate(
          { Guild: interaction.guild.id },
          { $set: { WelcomeChannel: channel.id } }
        );
        interaction.reply({
          content: `<:success:996733680422752347> Successfully set ${channel} as the greeting channel.`,
        });

        break;
      }

      case 'message-logs-channel': {
        const channel = args.getChannel('channel');

        await db.findOneAndUpdate(
          { Guild: interaction.guild.id },
          { $set: { MessageLogsChannel: channel.id } }
        );
        interaction.reply({
          content: `<:success:996733680422752347> Successfully set ${channel} as the message logs channel.`,
        });

        break;
      }
    }
  },
});
