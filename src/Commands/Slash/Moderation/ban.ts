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
import {
  ButtonStyle,
  Message,
  ButtonBuilder,
  ActionRowBuilder,
  ApplicationCommandOptionType,
  EmbedBuilder,
} from 'discord.js';

export default new Command({
  name: 'ban',
  description:
    'Suspends a member of this server from joining back on the specified account',
  options: [
    {
      name: 'member',
      type: ApplicationCommandOptionType.User,
      description: 'Member to be suspended from joining back',
      required: true,
    },
    {
      name: 'messages',
      type: ApplicationCommandOptionType.Integer,
      description: "Whether to delete member's messages or not",
      required: true,
      choices: [
        { name: 'Do not delete any messages.', value: 0 },
        { name: 'Delete messages sent in previous 24 hours.', value: 1 },
        { name: 'Delete messages sent in previous 7 days.', value: 7 },
      ],
    },
    {
      name: 'reason',
      type: ApplicationCommandOptionType.String,
      description: 'Reason for this action',
      required: false,
    },
  ],
  permissions: 'BanMembers',
  timeout: 5000,
  run: async ({ interaction, client, args }) => {
    let target = args.getUser('member');
    let amount = args.getInteger('messages');

    const bans = await interaction.guild.bans.fetch();
    let banned = bans.find((ban) => ban.user.id === target.id);
    if (banned)
      return interaction.reply({
        content: '⚠ The user is already banned.',
        ephemeral: true,
      });

    const isMember = interaction.guild.members.cache.get(target.id);
    if (
      isMember &&
      interaction.guild.ownerId !== target.id &&
      isMember.roles.highest.position >=
        interaction.member.roles.highest.position
    )
      return interaction.reply({
        content: '⚠ You do not have enough permissions to ban the member.',
        ephemeral: true,
      });

    if (target.id === interaction.user.id)
      return interaction.reply({
        content: '⚠ You cannot ban yourself.',
        ephemeral: true,
      });

    if (target.id === client.user.id)
      return interaction.reply({
        content: '⚠ You cannot ban the bot.',
        ephemeral: true,
      });

    let reason = args.getString('reason') || 'No reason provided.';

    let proceedButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Success)
      .setEmoji({ name: 'success', id: '996733680422752347' })
      .setLabel('Proceed')
      .setCustomId('ban-proceed');
    let cancelButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setEmoji({ name: 'cancel', id: '996733678279462932' })
      .setLabel(`Cancel`)
      .setCustomId('ban-cancel');
    let row = new ActionRowBuilder().addComponents([
      proceedButton,
      cancelButton,
    ]);
    let embed = new EmbedBuilder()
      .setTitle(`⚠ Are you sure?`)
      .setColor('#e03c3c')
      .setDescription(
        `Are you sure you want to ban **${target.tag}** with reason: \`${reason}\`?`
      )
      .setFooter({
        text: `This action will be automatically canceled in 10 seconds if you do not select any option.`,
      });
    const confirmation = await interaction.reply({
      content: `${interaction.user}`,
      embeds: [embed],
      fetchReply: true,
      components: [row as ActionRowBuilder<ButtonBuilder>],
    });
    const filter = (inter) => inter.user.id === interaction.user.id;
    const collector = (confirmation as Message).createMessageComponentCollector(
      {
        filter,
        time: 10000,
        max: 1,
      }
    );

    collector.on('collect', async (inter) => {
      if (inter.customId === 'proceed') {
        await inter.deferReply();
        await inter.followUp({
          content: `**🔨 ${inter.user.tag}** banned **${target.tag}**.\nReason: *${reason}*`,
        });
        await client.modLogs(
          {
            Member: target,
            Action: 'Ban',
            Reason: reason,
            Color: '#e03c3c',
          },
          interaction
        );
        await inter.guild.bans
          .create(target.id, {
            deleteMessageDays: amount,
            reason: `Banned by ${inter.user.tag} | Reason: ${reason}`,
          })
          .catch((error) => console.error(error));
      }
      if (inter.customId === 'back') {
        inter.message.delete();
      }
    });

    collector.on('end', async () => {
      let row = new ActionRowBuilder().addComponents([
        ButtonBuilder.from(proceedButton).setDisabled(),
        ButtonBuilder.from(cancelButton).setDisabled(),
      ]);
      (confirmation as Message).edit({
        embeds: [EmbedBuilder.from(embed)],
        components: [row as ActionRowBuilder<ButtonBuilder>],
      });
    });
  },
});
