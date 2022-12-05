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

import { GuildMemberRoleManager, Message, TextBasedChannel } from 'discord.js';
import { Button } from '../../../structures/Button';

export default new Button({
  id: 'report-delete',
  permissions: 'ManageMessages',
  run: async ({ interaction }) => {
    const regex = /\b\d+\b/g;
    const channelId = interaction.message.embeds[0].footer.text.match(regex)[2];
    const messageId = interaction.message.embeds[0].footer.text.match(regex)[1];
    const message = await (
      interaction.guild.channels.cache.get(channelId) as TextBasedChannel
    )?.messages
      .fetch(messageId)
      .catch(() => {
        interaction.reply({
          content: '⚠ Could not delete the message.',
          ephemeral: true,
        });
      });

    const isMember = interaction.guild.members.cache.get(
      (message as Message)?.author.id
    );
    if (
      isMember &&
      // interaction.guild.ownerId !== (message as Message)?.author.id &&
      (message as Message)?.member.roles.highest >=
        (interaction.member.roles as GuildMemberRoleManager).highest
    )
      return interaction.reply({
        content: '⚠ You do not have enough permissions to delete the message.',
        ephemeral: true,
      });

    await (message as Message)?.delete().catch(() => {
      interaction.reply({
        content: '⚠ Could not delete the message.',
        ephemeral: true,
      });
    });

    interaction.reply({
      content:
        '<:success:996733680422752347> Successfully deleted the message.',
    });
  },
});
