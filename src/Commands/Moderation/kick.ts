import { Command } from '../../structures/Command';
import Discord, {
  ApplicationCommandOptionType,
  GuildMember,
  GuildMemberRoleManager,
} from 'discord.js';

export default new Command({
  name: 'kick',
  description: 'Kicks the member from this server',
  options: [
    {
      name: 'member',
      type: ApplicationCommandOptionType.User,
      description: 'Member to be kicked from this server',
      required: true,
    },
    {
      name: 'reason',
      type: ApplicationCommandOptionType.String,
      description: 'Reason for this action',
      required: false,
    },
  ],
  permissions: 'KickMembers',
  timeout: 10000,
  run: async ({ interaction, client, args }) => {
    let target = interaction.options.getMember('member');

    if (target == null)
      return interaction.reply({
        content: `⚠ The user is not in the guild.`,
        ephemeral: true,
      });

    if (
      (target.roles as GuildMemberRoleManager).highest >=
      interaction.member.roles.highest
    )
      return interaction.reply({
        content: '⚠ You do not have enough permissions to kick the member.',
        ephemeral: true,
      });

    if ((target as GuildMember).id === interaction.user.id) {
      return interaction.reply({
        content: '⚠ You cannot kick yourself.',
        ephemeral: true,
      });
    }
    if ((target as GuildMember).id === client.user.id) {
      return interaction.reply({
        content: '⚠ You cannot kick the bot.',
        ephemeral: true,
      });
    }

    let reason = args.getString('reason') || 'No reason provided.';

    await interaction.reply({
      content: `👢 **${interaction.user.tag}** kicked **${
        (target as GuildMember).user.tag
      }**.\nReason: *${reason}*`,
    });
    await client.modLogs(
      {
        Action: 'Kick',
        Color: '#329da8',
        Member: (target as GuildMember).user,
        Reason: reason,
      },
      interaction
    );
    await (target as GuildMember).kick(
      `Kicked by ${interaction.user.tag} | Reason: ${reason}`
    );
  },
});
