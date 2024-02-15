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

import { TextChannel, EmbedBuilder } from 'discord.js';
import { Modal } from '../../../structures/Modal';
import suggestions from '../../../utils/models/suggestions';
import { getLink } from '../../../utils/functions/getLink';

export default new Modal({
  id: 'suggestion-modal',
  run: async ({ interaction, client }) => {
    const title = interaction.fields.getTextInputValue('suggestion-title');
    const description = interaction.fields.getTextInputValue(
      'suggestion-description'
    );
    const area = interaction.fields.getTextInputValue('suggestion-area');

    const suggestionsSystem = await suggestions.findOne({
      Guild: interaction.guildId,
      Toggled: true,
    });
    const channel = suggestionsSystem.Channel;

    (interaction.guild.channels.cache.get(channel) as TextChannel)
      .send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`New Suggestion - ${title}`)
            .addFields([
              { name: 'Description', value: description },
              { name: 'Area', value: area },
            ])
            .setAuthor({
              name: `${interaction.user.tag} (${interaction.user.id})`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setFooter({ text: 'Unreviewed' })
            .setTimestamp()
            .setColor('Yellow'),
        ],
      })
      .then(async (message) => {
        interaction.reply({
          content: `Your suggestion has been successfully sent. You can access it [here](<${getLink(
            { value: message }
          )}>).`,
          ephemeral: true,
        });
        await message.react('👍');
        await message.react('👎');
      });
  },
});
