import { GuildMemberRoleManager } from 'discord.js';
import { Button } from '../../../structures/Button';

export default new Button({
  id: 'report-ban',
  permissions: 'BanMembers',
  run: async ({ interaction, client }) => {
    const user = client.users.cache.get(
      interaction.message.embeds[0].footer.text.match(/\b\d+\b/g)[0]
    );

    const bans = await interaction.guild.bans.fetch();
    let banned = bans.find((ban) => ban.user.id === user.id);
    if (banned)
      return interaction.reply({
        content: '⚠ The user is already banned.',
        ephemeral: true,
      });

    const isMember = interaction.guild.members.cache.get(user.id);
    if (
      isMember &&
      interaction.guild.ownerId !== user.id &&
      isMember.roles.highest >=
        (interaction.member.roles as GuildMemberRoleManager).highest
    )
      return interaction.reply({
        content: '⚠ You do not have enough permissions to ban the member.',
        ephemeral: true,
      });

    if (user.id === interaction.user.id)
      return interaction.reply({
        content: '⚠ You cannot ban yourself.',
        ephemeral: true,
      });

    if (user.id === client.user.id)
      return interaction.reply({
        content: '⚠ You cannot ban the bot.',
        ephemeral: true,
      });

    await interaction.guild.bans
      .create(user.id, {
        deleteMessageDays: 7,
        reason: `Banned by ${interaction.user.tag} | Reason: Action held within a report`,
      })
      .catch((error) => console.error(error));

    interaction.reply({
      content: `**🔨 ${interaction.user.tag}** banned **${user.tag}**.`,
    });
  },
});
