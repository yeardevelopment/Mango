import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../structures/Command';
import db from '../../utils/models/config';

export default new Command({
  name: 'set',
  description: 'Sets configuration settings for the guild',
  options: [
    {
      name: 'muterole',
      description:
        'Sets the role that will be used for mute command and automatical mutes',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'role',
          type: ApplicationCommandOptionType.Role,
          description: 'Role to be used for mute command and automatical mutes',
          required: true,
        },
      ],
    },
  ],
  permissions: 'ManageGuild',
  timeout: 10000,
  run: async ({ interaction, args }) => {
    switch (args.getSubcommand()) {
      case 'muterole': {
        const role = args.getRole('role');

        await db.findOneAndUpdate(
          { Guild: interaction.guildId },
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
    }
  },
});
