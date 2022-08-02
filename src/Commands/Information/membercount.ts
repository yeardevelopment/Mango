import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';

export default new Command({
  name: 'membercount',
  description:
    "Displays the server's members count along with online members count",
  timeout: 10000,
  run: async ({ interaction, client }) => {
    await interaction.guild.members
      .fetch({ withPresences: true })
      .then((fetchedMembers) => {
        const totalOnline = fetchedMembers.filter(
          (member) =>
            member.presence?.status === 'online' ||
            member.presence?.status === 'idle' ||
            member.presence?.status === 'dnd'
        );
        const veryTotal = totalOnline.size;
        const Embed = new EmbedBuilder()
          .setTitle('Member Count')
          .setDescription(
            `**Total Members:** ${interaction.guild.memberCount}\n**Online Members:** ${veryTotal}`
          )
          .setColor('#ea664b');
        interaction.reply({
          embeds: [Embed],
        });
      });
  },
});
