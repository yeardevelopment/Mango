import {
  GuildMemberRoleManager,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import { Button } from '../../../structures/Button';
import ticket from '../../../utils/models/ticket';
import tickets from '../../../utils/models/tickets';

export default new Button({
  id: 'close',
  
  run: async ({ interaction }) => {
    const ticketSystem = await ticket.findOne({
      Guild: interaction.guildId,
      Toggled: true,
    });
    if (!ticketSystem) return;
    if (
      !(interaction.member.roles as GuildMemberRoleManager).cache.has(
        ticketSystem.StaffRole
      )
    )
      return interaction.reply({
        content: '⚠ Only staff can close the ticket.',
        ephemeral: true,
      });
    const docs = await tickets.findOne({ ID: interaction.channelId });
    if (docs.Closed === true) {
      return interaction.reply({
        content: 'This ticket is already being closed.',
        ephemeral: true,
      });
    }
    let row = new ActionRowBuilder().addComponents([
      new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setEmoji({ name: 'success', id: '996733680422752347' })
        .setLabel('Proceed')
        .setCustomId('sure'),
    ]);
    interaction.reply({
      components: [row as ActionRowBuilder<ButtonBuilder>],
      embeds: [
        new EmbedBuilder()
          .setTitle('⚠ Are you sure?')
          .setDescription(
            'Are you sure you want to close this ticket?\nThis action cannot be undone.'
          )
          .setColor('#ff0000'),
      ],
      ephemeral: true,
      fetchReply: true,
    });
  },
});
