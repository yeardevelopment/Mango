// Mango Bot - multifunctional Discord application service.
// Copyright (C) 2022  YEAR Development

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

import { Command } from '../../../structures/Command';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default new Command({
  name: 'premium',
  description: 'Support Mango by subscribing to Mango Premium',
  timeout: 5000,
  run: async ({ interaction }) => {
    interaction.reply({
      content:
        'We would be grateful to you if you subscribed to Mango Premium. You can ask for instructions in our support server linked down below.',
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('Support Server')
            .setEmoji({ name: 'support', id: '996734485120962591' })
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.gg/QeKcwprdCY'),
          new ButtonBuilder()
            .setLabel('Invite Mango')
            .setEmoji({ name: 'invite', id: '997622250587033661' })
            .setStyle(ButtonStyle.Link)
            .setURL(
              'https://discord.com/api/oauth2/authorize?client_id=950781887230664725&permissions=1494716116054&scope=bot%20applications.commands'
            )
        ) as ActionRowBuilder<ButtonBuilder>,
      ],
    });
  },
});
