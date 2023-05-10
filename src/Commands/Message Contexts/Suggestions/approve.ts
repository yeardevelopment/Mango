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
import { EmbedBuilder, ApplicationCommandType } from 'discord.js';
import suggestions from '../../../utils/models/suggestions';

export default new MessageContext({
  name: 'Approve Suggestion',
  type: ApplicationCommandType.Message,
  permissions: 'ManageMessages',
  timeout: 5000,
  run: async ({ interaction }) => {
    const suggestionsSystem = await suggestions.findOne({
      Guild: interaction.guildId,
      Toggled: true,
    });
    if (!suggestionsSystem) return;
    if (
      !suggestionsSystem.Channel ||
      !interaction.guild.channels.cache.get(suggestionsSystem.Channel)
    )
      return interaction.reply({
        content: '⚠️ The suggestions system is not set up properly.',
        ephemeral: true,
      });

    const target = interaction.targetMessage;
    if (target.channelId !== suggestionsSystem.Channel) return;

    if (target.embeds[0].hexColor === '#009A44')
      return interaction.reply({
        content:
          '<:cancel:996733678279462932> The suggestion is already approved.',
        ephemeral: true,
      });

    try {
      await target.edit({
        embeds: [
          EmbedBuilder.from(target.embeds[0])
            .setColor('#009A44')
            .setFooter({ text: 'Approved' }),
        ],
      });
      interaction.reply({
        content:
          '<:success:996733680422752347> Successfully updated the suggestion status.',
        ephemeral: true,
      });
    } catch (error) {
      interaction.reply({
        content:
          '<:cancel:996733678279462932> Could not update the suggestion status. This might be due to the suggestion being older than 14 days or permission issues.',
        ephemeral: true,
      });
    }
  },
});
