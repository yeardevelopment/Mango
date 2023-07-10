import { GuildChannel } from 'discord.js';
import { UserSelectMenu } from '../../structures/UserSelectMenu';
import tickets from '../../utils/models/tickets';

export default new UserSelectMenu({
  id: 'ticket-member-involve',
  run: async ({ interaction, client }) => {
    const member = interaction.users[0];

    const data = await tickets.findOne({ ID: interaction.channel.id });
    if (data.Members.includes(member.id))
      return interaction.reply({
        content: `⚠ The member is already invloved in the ticket.`,
        ephemeral: true,
      });

    data.Members.push(member.id);

    (interaction.channel as GuildChannel).permissionOverwrites.create(
      member.id,
      {
        SendMessages: true,
        ViewChannel: true,
        AttachFiles: true,
        ReadMessageHistory: true,
        AddReactions: true,
      }
    );

    interaction.reply({
      content: `<:success:996733680422752347> Successfully involved **${member.user.tag}** into this ticket.`,
      
    });
  },
});
