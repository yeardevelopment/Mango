// Mango Bot - multifunctional Discord application service.
// Copyright (C) 2023  YEAR Development

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

import {
  GuildMemberRoleManager,
  GuildChannel,
  OverwriteType,
  EmbedBuilder,
  TextChannel,
} from 'discord.js';
import { Button } from '../../../structures/Button';
import ticket from '../../../utils/models/ticket';
import tickets from '../../../utils/models/tickets';

export default new Button({
  id: 'ticket-lock',
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
        (interaction.channel as TextChannel)?.send({
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
        (interaction.channel as TextChannel)?.send({
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
