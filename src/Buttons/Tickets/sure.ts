import { createTranscript } from 'discord-html-transcripts';
import {
  GuildMemberRoleManager,
  TextBasedChannel,
  EmbedBuilder,
  GuildTextBasedChannel,
} from 'discord.js';
import { client } from '../..';
import { Button } from '../../structures/Button';
import ticket from '../../utils/models/ticket';
import tickets from '../../utils/models/tickets';

export default new Button({
  id: 'sure',
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
        content: '⚠ Only staff can close the ticket.',
        ephemeral: true,
      });
    const data = await tickets.findOne({ ID: interaction.channelId });
    if (data.Closed === true) {
      return interaction.reply({
        content: `This ticket is already being closed.`,
        ephemeral: true,
      });
    }
    interaction.deferUpdate();
    await tickets.updateOne({ ID: interaction.channelId }, { Closed: true });
    const attachment = await createTranscript(interaction.channel, {
      limit: -1,
      returnBuffer: false,
      saveImages: true,
      fileName: `transcript-${interaction.channel.name}.html`,
    });
    interaction.channel?.send({
      content: `Closing the ticket <t:${Math.floor(
        (Date.now() + 20000) / 1000
      )}:R>...`,
    });
    let member = client.users.cache.get(data.Member);

    await (
      client.channels.cache.get(ticketSystem.LogsChannel) as TextBasedChannel
    )?.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Ticket Closed')
          .setDescription(
            `**Ticket Name**: \`${interaction.channel.name}\` (${
              interaction.channelId
            })\n**Opened By**: \`${member.tag}\` (${
              member.id
            })\n**Closed By**: \`${interaction.user.tag}\` (${
              interaction.user.id
            })\n**Open Reason**: \`${
              data.OpenReason
            }\`\n**Open Time**: <t:${Math.floor(
              interaction.channel.createdTimestamp / 1000
            )}>`
          )
          .setColor('#ea664b')
          .setTimestamp(Date.now() + 20000),
      ],
      files: [attachment],
    });
    setTimeout(() => {
      interaction.channel
        ?.delete('[Ticket System] Ticket Closed')
        .then(async (channel: GuildTextBasedChannel) => {
          const data = await tickets.findOne({ ID: channel.id });
          if (data) data.delete();
        });
    }, 20000);
  },
});
