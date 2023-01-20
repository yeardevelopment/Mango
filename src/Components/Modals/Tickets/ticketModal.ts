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
  TextBasedChannel,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalSubmitInteraction,
} from 'discord.js';
import { Modal } from '../../../structures/Modal';
import ticket from '../../../utils/models/ticket';
import tickets from '../../../utils/models/tickets';

export default new Modal({
  id: 'ticket-modal',
  run: async ({ interaction, client }) => {
    const ticketSystem = await ticket.findOne({
      Guild: interaction.guildId,
      Toggled: true,
    });
    const parentChannel = ticketSystem.Category;
    await interaction.reply({
      content: `<:loading:1011290361450221718> Your ticket is being processed. Please wait.`,
      ephemeral: true,
    });
    let channel: TextBasedChannel | null = null;
    try {
      channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        reason: 'Ticket opened',
        parent: parentChannel,
        permissionOverwrites: [
          {
            id: interaction.guildId,
            deny: ['SendMessages', 'ViewChannel'],
          },
          {
            id: interaction.user.id,
            allow: [
              'SendMessages',
              'ViewChannel',
              'AttachFiles',
              'ReadMessageHistory',
              'AddReactions',
            ],
          },
          {
            id: client.user.id,
            allow: ['SendMessages', 'ViewChannel'],
          },
          {
            id: ticketSystem.StaffRole,
            allow: [
              'SendMessages',
              'ViewChannel',
              'AttachFiles',
              'ReadMessageHistory',
              'AddReactions',
            ],
          },
        ],
      });
      await tickets.create({
        ID: channel.id,
        Member: interaction.user.id,
        Guild: interaction.guildId,
        OpenReason: interaction.fields.getTextInputValue('reason'),
        Members: [interaction.user.id],
        Closed: false,
        Claimed: false,
        Locked: false,
      });
    } catch (error) {}
    await interaction.editReply({
      content: `We will be right with you! ${channel}`,
    });
    const embedticket = new EmbedBuilder()
      .setTitle(`Welcome to your ticket!`)
      .addFields([
        {
          name: 'Open Reason',
          value: interaction.fields.getTextInputValue('reason'),
        },
      ])
      .setFooter({
        text: 'Your ticket should be handled shortly. In the meantime, you may describe your question in more detail.',
      })
      .setColor('#ea664b');
    let close = new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setEmoji('💾')
      .setLabel('Save & Close')
      .setCustomId('ticket-close');
    let lock = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🔒')
      .setLabel('Lock/Unlock')
      .setCustomId('ticket-lock');
    let row = new ActionRowBuilder().addComponents([close, lock]);
    channel.send({
      content: `<@${interaction.user.id}>`,
      embeds: [embedticket],
      components: [row as ActionRowBuilder<ButtonBuilder>],
    });
  },
});
