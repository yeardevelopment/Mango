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

import { Command } from '../../../structures/Command';
import { ApplicationCommandOptionType, GuildMember } from 'discord.js';

export default new Command({
  name: 'clear',
  description: 'Deletes multiple messages in the channel',
  options: [
    {
      name: 'amount',
      type: ApplicationCommandOptionType.Integer,
      description: 'The amount of messages that are going to be deleted.',
      minValue: 1,
      maxValue: 100,
      required: true,
    },
    {
      name: 'target',
      type: ApplicationCommandOptionType.User,
      description: 'Select a target to clear their messages in the channel.',
      required: false,
    },
  ],
  permissions: 'ManageMessages',
  timeout: 5000,
  run: async ({ interaction, args }) => {
    let amount = args.getInteger('amount');
    let target = args.getMember('target');
    let reason = args.getString('reason') || 'No reason provided.';

    const messages = await interaction.channel.messages.fetch();

    if (target) {
      let i = 0;
      const filtered = [];
      messages.filter((m): any => {
        if (m.author.id === (target as GuildMember).id && amount > i) {
          filtered.push(m);
          i++;
        }
      });
      await interaction.channel.bulkDelete(filtered, true).then((messages) => {
        interaction.reply({
          content: `<:success:996733680422752347> Successfully cleared **${
            messages.size
          } message${messages.size > 1 ? 's' : ''}** from **${
            (target as GuildMember).user.tag
          }**.`,
        });
      });
    } else {
      try {
        await interaction.reply({ content: 'Clearing...', ephemeral: true });
        const fetch = await interaction.channel.messages.fetch({
          limit: amount,
        });
        const deletedMessages = await interaction.channel.bulkDelete(
          fetch,
          true
        );

        const results = {};
        for (const [, deleted] of deletedMessages) {
          const user = `${deleted.author.tag}`;
          if (!results[user]) results[user] = 0;
          results[user]++;
        }

        await interaction.editReply({
          content: '<:success:996733680422752347> Successfully cleared.',
        });

        const userMessageMap = Object.entries(results);

        const finalResult = `${deletedMessages.size} message${
          deletedMessages.size > 1 ? 's were' : ' was'
        } removed.`;
        const deleteCount = `${userMessageMap
          .map(([user, messages]) => `**${user}**: ${messages}`)
          .join('\n')}`;

        const summaryMessage = await interaction.channel.send({
          content: `${finalResult}\n\n${deleteCount}`,
          allowedMentions: {
            roles: [],
            users: [],
          },
        });
        setTimeout(() => summaryMessage.delete(), 5000);
      } catch (error) {
        console.error(error);
      }
    }
  },
});
