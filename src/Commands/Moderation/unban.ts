import { Command } from '../../structures/Command';
import Discord, { ApplicationCommandOptionType } from 'discord.js';

export default new Command({
  name: 'unban',
  description: "Revokes a member's ban in this server",
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionType.User,
      description: 'User to be unbanned',
      required: true,
    },
    {
      name: 'reason',
      type: ApplicationCommandOptionType.String,
      description: 'Reason for this action',
      required: false,
    },
  ],
  permissions: 'BanMembers',
  timeout: 5000,
  run: async ({ interaction, client, args }) => {
    let target = args.getUser('user');

    if (target.id === interaction.user.id)
      return interaction.reply({
        content: '⚠ You cannot unban yourself.',
        ephemeral: true,
      });

    if (target.id === client.user.id)
      return interaction.reply({
        content: '⚠ You cannot unban the bot.',
        ephemeral: true,
      });

    let reason = args.getString('reason') || 'No reason provided.';

    await interaction.guild.bans.fetch().then(async (bans) => {
      if (bans.size === 0)
        return interaction.reply({
          content: '⚠ No one is banned in this server.',
          ephemeral: true,
        });
      let banned = bans.find((ban) => ban.user.id === target.id);
      if (!banned)
        return interaction.reply({
          content: '⚠ The user is not banned.',
          ephemeral: true,
        });
    });

    await interaction.guild.members.unban(
      target.id,
      `Unbanned by ${interaction.user.tag} | Reason: ${reason}`
    );
    await interaction.reply({
      content: `Successfully unbanned **${target.tag}**.`,
      ephemeral: false,
    });

    await client.modLogs(
      {
        Action: 'Unban',
        Color: '#009A44',
        Member: target,
        Reason: reason,
      },
      interaction
    );
  },
});
