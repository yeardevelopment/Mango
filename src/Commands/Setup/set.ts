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
          content: `Successfully set ${role} as the mute role.`,
          allowedMentions: {
            roles: [],
          },
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
          content: `Successfully set ${channel} as the greeting channel.`,
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
          content: `Successfully set ${channel} as the message logs channel.`,
        });

        break;
      }
    }
  },
});
