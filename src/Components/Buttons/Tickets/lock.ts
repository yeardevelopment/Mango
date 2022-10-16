import {
  GuildMemberRoleManager,
  GuildChannel,
  OverwriteType,
  EmbedBuilder,
  ButtonInteraction,
  CommandInteraction,
  ModalSubmitInteraction,
} from 'discord.js';
import { Button } from '../../../structures/Button';
import ticket from '../../../utils/models/ticket';
import tickets from '../../../utils/models/tickets';

export default new Button({
  id: 'lock',
  run: async ({ interaction }) => {
    const ticketSystem = await ticket.findOne({
      Guild: interaction.guildId,
      Toggled: true,
    });
    if (!ticketSystem) return;
    if (interaction.channel.parentId !== ticketSystem.Category) return;
    if (
      !(interaction.member.roles as GuildMemberRoleManager).cache.has(
        ticketSystem.StaffRole
      )
    )
      return interaction.reply({
        content: '⚠ Only staff can lock/unlock the ticket.',
        ephemeral: true,
      });
    const data = await tickets.findOne({ ID: interaction.channel.id });
    if (data.Locked === false) {
      try {
        await tickets.updateOne(
          { ID: interaction.channel.id },
          { Locked: true }
        );
        for (let member of data.Members) {
          await (interaction.channel as GuildChannel).permissionOverwrites.edit(
            member,
            {
              SendMessages: false,
              AddReactions: false,
            },
            { type: OverwriteType.Member }
          );
        }
        interaction.channel?.send({
          embeds: [
            new EmbedBuilder()
              .setTitle('Ticket Locked')
              .setDescription('This ticket has been locked by a staff member.')
              .setColor('#ea664b'),
          ],
        });
        interaction.reply({
          content:
            '<:success:996733680422752347> Successfully locked the ticket.',
          ephemeral: true,
        });
      } catch (error) {}
    } else {
      try {
        await tickets.updateOne(
          { ID: interaction.channel.id },
          { Locked: false }
        );
        for (let member of data.Members) {
          await (interaction.channel as GuildChannel).permissionOverwrites.edit(
            member,
            {
              SendMessages: true,
              AddReactions: true,
            },
            { type: OverwriteType.Member }
          );
        }
        interaction.channel?.send({
          embeds: [
            new EmbedBuilder()
              .setTitle('Ticket Unlocked')
              .setDescription(
                'This ticket has been unlocked by a staff member.'
              )
              .setColor('#ea664b'),
          ],
        });
        interaction.reply({
          content:
            '<:success:996733680422752347> Successfully unlocked the ticket.',
          ephemeral: true,
        });
      } catch (error) {}
    }
  },
});
