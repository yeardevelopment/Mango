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

import { Command } from '../../../structures/Command';
import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import suggestions from '../../../utils/models/suggestions';

export default new Command({
  name: 'suggest',
  description: 'Files a suggestion to the suggestions channel',
  timeout: 5000,
  run: async ({ interaction, args }) => {
    const suggestionsSystem = await suggestions.findOne({
      Guild: interaction.guildId,
      Toggled: true,
    });
    if (!suggestionsSystem || !suggestionsSystem.Channel)
      return interaction.reply({
        content:
          '⚠️ The suggestions system is not set up properly yet. Please contact staff with this information.',
        ephemeral: true,
      });
    interaction.showModal(
      new ModalBuilder()
        .setTitle('New Suggestion')
        .setCustomId('suggestion-modal')
        .addComponents([
          new ActionRowBuilder().addComponents([
            new TextInputBuilder()
              .setLabel('Title')
              .setCustomId('suggestion-title')
              .setMaxLength(50)
              .setRequired()
              .setStyle(TextInputStyle.Short),
          ]) as ActionRowBuilder<TextInputBuilder>,
          new ActionRowBuilder().addComponents([
            new TextInputBuilder()
              .setLabel('Description')
              .setPlaceholder(
                'Describe your idea in more detail; the more context, the better.'
              )
              .setCustomId('suggestion-description')
              .setMaxLength(200)
              .setRequired()
              .setStyle(TextInputStyle.Paragraph),
          ]) as ActionRowBuilder<TextInputBuilder>,
          new ActionRowBuilder().addComponents([
            new TextInputBuilder()
              .setLabel('Area (Discord, Minecraft, etc.)')
              .setCustomId('suggestion-area')
              .setMaxLength(50)
              .setRequired()
              .setStyle(TextInputStyle.Short),
          ]) as ActionRowBuilder<TextInputBuilder>,
        ])
    );
  },
});
