import { Command } from '../../../structures/Command';
import { EmbedBuilder } from 'discord.js';

export default new Command({
  name: 'membercount',
  description:
    "Displays the server's members count along with online members count",
  timeout: 5000,
  run: async ({ interaction }) => {
    await interaction.guild.members
      .fetch({ withPresences: true })
      .then((fetchedMembers) => {
        const totalOnline = fetchedMembers.filter(
          (member) =>
            member.presence?.status === 'online' ||
            member.presence?.status === 'idle' ||
            member.presence?.status === 'dnd'
        );
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Member Count')
              .setDescription(
                `**Total Members:** ${interaction.guild.memberCount}\n**Online Members:** ${totalOnline.size}`
              )
              .setColor('#ea664b'),
          ],
        });
      });
  },
});
