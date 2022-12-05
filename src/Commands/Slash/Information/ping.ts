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
import Discord from 'discord.js';

export default new Command({
  name: 'ping',
  description: "Calculates the bot's ping along with API Latency",
  timeout: 5000,
  run: async ({ interaction, client }) => {
    await interaction
      .reply({ content: 'Calculating ping...' })
      .then((resultMessage) => {
        const ping: number = Date.now() - interaction.createdTimestamp;
        interaction.editReply({
          content: '\u200B',
          embeds: [
            new Discord.EmbedBuilder()
              .setTitle('Pong!')
              .setAuthor({
                name: `${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .setDescription(
                `:ping_pong: Bot Latency is ${ping} ms\n:hourglass: API Latency is ${Math.round(
                  client.ws.ping
                )} ms`
              )
              .setColor('#ea664b'),
          ],
        });
      });
  },
});
