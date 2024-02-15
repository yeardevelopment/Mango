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

import {
  ColorResolvable,
  CommandInteraction,
  EmbedBuilder,
  TextChannel,
  User,
} from 'discord.js';
import { getLink } from './getLink';
import db from '../models/config';
import modLogs from '../models/modLogs';

export async function modlogs(
  {
    Member,
    Action,
    Reason,
    Color,
    Duration,
  }: {
    Member: User;
    Action: string;
    Reason: string;
    Color: ColorResolvable;
    Duration?: string;
  },
  interaction: CommandInteraction
): Promise<void> {
  const data = await modLogs.findOne({
    Guild: interaction.guildId,
    Toggled: true,
  });
  if (!data) return;

  const configDB = await db.findOne({
    Guild: interaction.guildId,
  });

  await db.findOneAndUpdate(
    { Guild: interaction.guildId },
    {
      $inc: { CaseCount: 1 },
    }
  );
  const duration = Duration ? `**Duration**: ${Duration}\n` : '';
  const logsEmbed = new EmbedBuilder()
    .setColor(Color)
    .setAuthor({
      name: `${interaction.user.tag} (${interaction.user.id})`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setDescription(
      `**Member**: \`${Member.tag}\` (${
        Member.id
      })\n**Action**: ${Action}\n${duration}**Reason**: ${Reason}\n**Link**: [Click here ›](${getLink(
        { value: interaction }
      )})`
    )
    .setFooter({ text: `Case #${configDB.CaseCount}` })
    .setTimestamp()
    .setThumbnail(Member.displayAvatarURL());

  await (
    interaction.guild.channels.cache.get(data.Channel) as TextChannel
  )?.send({ embeds: [logsEmbed] });

  let dmEmbed = new EmbedBuilder()
    .setTitle(`New Moderation Action Executed Towards You`)
    .setDescription(
      `**Moderator**: \`${interaction.user.tag}\` (${
        interaction.user.id
      })\n**Action**: ${Action}\n${duration}**Reason**: ${Reason}\n**Link**: [Click here ›](${getLink(
        { value: interaction }
      )})`
    )
    .setColor(Color)
    .setFooter({
      text: `Case #${configDB.CaseCount}`,
    })
    .setTimestamp();

  await Member?.send({
    embeds: [dmEmbed],
  }).catch((error) => console.error(error));
}
