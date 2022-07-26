import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../structures/Command';
import db from '../../utils/models/config';

export default new Command({
  name: 'set',
  description: 'Sets configuration settings for the guild',
  options: [
    {
      name: 'mute-role',
      description:
        'Sets the role that will be used for mute command and automatical mutes',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'role',
          type: ApplicationCommandOptionType.Role,
          description: 'Role to be used for mute command and automatical mutes',
          required: false,
        },
      ],
    },
  ],
  permissions: 'ManageGuild',
  timeout: 10000,
  run: async ({ interaction, args }) => {
    switch (args.getSubcommand()) {
      case 'mute-role': {
        let role = args.getRole('role');
        const isRole = role ? role.id : '';

        const data = await db.findOne({ Guild: interaction.guildId });
        if (data) {
          await db.findOneAndUpdate(
            {
              Guild: interaction.guildId,
            },
            {
              $set: { MuteRole: isRole },
            }
          );
        } else {
          await db.create({ Guild: interaction.guildId, MuteRole: isRole });
        }
        interaction.reply({
          content: `<:success:996733680422752347> Successfully updated the mute role.`,
        });
        break;
      }
    }
  },
});
