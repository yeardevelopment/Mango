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

import { MessageContext } from '../../../structures/MessageContext';
import {
  EmbedBuilder,
  ApplicationCommandType,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  TextChannel,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import report from '../../../utils/models/report';
import { getLink } from '../../../utils/functions/getLink';

export default new MessageContext({
  name: 'Report Message',
  type: ApplicationCommandType.Message,
  timeout: 5000,
  run: async ({ interaction }) => {
    const target = interaction.targetMessage;
    const reportSystem = await report.findOne({
      Guild: interaction.guildId,
      Toggled: true,
    });
    if (!reportSystem) return;
    if (
      !reportSystem.Channel ||
      !interaction.guild.channels.cache.get(reportSystem.Channel)
    )
      return interaction.reply({
        content:
          '⚠️ The report system is not set up properly yet. Please contact staff with this information.',
        ephemeral: true,
      });

    if (target.author.id === interaction.user.id)
      return interaction.reply({
        content: '⚠ You cannot report your message.',
        ephemeral: true,
      });

    interaction.showModal(
      new ModalBuilder()
        .setTitle('Message Report')
        .setCustomId('message-report')
        .addComponents([
          new ActionRowBuilder().addComponents([
            new TextInputBuilder()
              .setLabel('Reason for the report')
              .setPlaceholder(
                'Provide a sensible and detailed reason for the report'
              )
              .setCustomId('reason')
              .setMinLength(10)
              .setMaxLength(1000)
              .setRequired()
              .setStyle(TextInputStyle.Paragraph),
          ]) as ActionRowBuilder<TextInputBuilder>,
        ])
    );

    const modalSubmit = await interaction.awaitModalSubmit({
      filter: (i) => {
        return true;
      },
      time: 300000,
    });
    modalSubmit.reply({
      content:
        '<:success:996733680422752347> Your report has been sent to the staff team. Thank you.',
      ephemeral: true,
    });
    (
      modalSubmit.guild.channels.cache.get(reportSystem.Channel) as TextChannel
    ).send({
      embeds: [
        new EmbedBuilder()
          .setTitle('New Message Report')
          .setURL(getLink({ value: target }))
          .setDescription(
            `**Message Content**: \`${
              target.content
            }\`\n**Message Author**: \`${
              target.author.tag
            }\`\n**Reported By**: \`${
              modalSubmit.user.tag
            }\`\n**Reason**: \`${modalSubmit.fields.getTextInputValue(
              'reason'
            )}\``
          )
          .setColor('#ea664b')
          .setFooter({
            text: `ID: ${target.author.id}-${target.id}-${target.channelId}`,
          })
          .setTimestamp(),
      ],
      components: [
        new ActionRowBuilder().addComponents([
          new ButtonBuilder()
            .setLabel('Delete Message')
            .setCustomId('report-delete')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🗑️'),
          new ButtonBuilder()
            .setLabel('Mute')
            .setCustomId('report-mute')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🔇'),
          new ButtonBuilder()
            .setLabel('Ban')
            .setCustomId('report-ban')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔨'),
        ]) as ActionRowBuilder<ButtonBuilder>,
      ],
    });
  },
});
