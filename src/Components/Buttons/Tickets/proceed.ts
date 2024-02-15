// Mango Bot - multifunctional Discord application service.
// Copyright (C) 2024  YEAR Development

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

import { createTranscript } from 'discord-html-transcripts';
import { ExportReturnType } from 'discord-html-transcripts/dist/types';
import {
  GuildMemberRoleManager,
  TextChannel,
  EmbedBuilder,
  GuildBasedChannel,
  time,
} from 'discord.js';
import { client } from '../../..';
import { Button } from '../../../structures/Button';
import ticket from '../../../utils/models/ticket';
import tickets from '../../../utils/models/tickets';

export default new Button({
  id: 'ticket-proceed',
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
      returnType: ExportReturnType.Attachment,
      saveImages: true,
      filename: `transcript-${interaction.channel.name}.html`,
      poweredBy: true,
    });
    (interaction.channel as TextChannel)?.send({
      content: `Closing the ticket <t:${Math.floor(
        (Date.now() + 20000) / 1000
      )}:R>...`,
    });
    let member = client.users.cache.get(data.Member);

    await (
      client.channels.cache.get(ticketSystem.LogsChannel) as TextChannel
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
            })\n**Open Reason**: \`${data.OpenReason}\`\n**Open Time**: ${time(
              interaction.channel.createdAt
            )}`
          )
          .setColor('#ea664b')
          .setTimestamp(Date.now() + 20000),
      ],
      files: [attachment],
    });
    setTimeout(() => {
      interaction.channel
        ?.delete('[Ticket System] Ticket Closed')
        .then(async (channel: GuildBasedChannel) => {
          const data = await tickets.findOne({ ID: channel.id });
          if (data) data.deleteOne();
        });
    }, 20000);
  },
});
