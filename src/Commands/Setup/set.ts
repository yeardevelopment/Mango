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
    }
  },
});
