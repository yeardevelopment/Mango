import {
  ButtonInteraction,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { Button } from '../../../structures/Button';
import ticket from '../../../utils/models/ticket';
import tickets from '../../../utils/models/tickets';

export default new Button({
  id: 'ticket',
  run: async ({ interaction }) => {
    const ticketSystem = await ticket.findOne({
      Guild: interaction.guildId,
      Toggled: true,
    });
    if (!ticketSystem) return;
    if (!ticketSystem.StaffRole)
      return (interaction as ButtonInteraction).reply({
        content:
          '⚠️ The ticket system is not set up properly yet. Please contact staff with this information.',
        ephemeral: true,
      });
    const ticketChannel = await tickets.findOne({
      Guild: interaction.guildId,
      Member: interaction.user.id,
    });
    if (ticketChannel)
      return interaction.reply({
        content: `<:cancel:996733678279462932> You already have a ticket open: <#${ticketChannel.ID}>.`,
        ephemeral: true,
      });
    interaction.showModal(
      new ModalBuilder()
        .setTitle('Ticket System')
        .setCustomId('ticket-modal')
        .addComponents([
          new ActionRowBuilder().addComponents([
            new TextInputBuilder()
              .setLabel('Why are you opening this ticket?')
              .setCustomId('reason')
              .setMaxLength(100)
              .setRequired()
              .setStyle(TextInputStyle.Short),
          ]) as ActionRowBuilder<TextInputBuilder>,
        ])
    );
  },
});
