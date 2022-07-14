import {
  ColorResolvable,
  CommandInteraction,
  MessageEmbed,
  TextBasedChannel,
} from 'discord.js';
import { getLink } from './getLink';
import db from '../models/config';
import modLogs from '../models/modLogs';
import { User } from 'discord.js';

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
) {
  const data = await modLogs.findOne({
    Guild: interaction.guild.id,
    Toggled: true,
  });
  if (!data) return;

  const docs = await db.findOne({ Guild: interaction.guild.id });
  if (!docs.ModerationLogsChannel) return;

  await db.findOneAndUpdate(
    { Guild: interaction.guild.id },
    {
      $inc: { CaseCount: 1 },
    }
  );
  const duration = Duration ? `**Duration**: ${Duration}\n` : '';
  const logsEmbed = new MessageEmbed()
    .setColor(Color)
    .setAuthor({
      name: `${interaction.user.tag} (${interaction.user.id})`,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    })
    .setDescription(
      `**Member**: \`${Member.tag}\` (${
        Member.id
      })\n**Action**: ${Action}\n${duration}**Reason**: ${Reason}\n**Link**: [Click here](${getLink(
        interaction
      )})`
    )
    .setFooter({ text: `Case #${docs.CaseCount}` })
    .setTimestamp()
    .setThumbnail(Member.displayAvatarURL({ dynamic: true }));

  await (
    interaction.guild.channels.cache.get(
      docs.ModerationLogsChannel
    ) as TextBasedChannel
  ).send({ embeds: [logsEmbed] });

  let dmEmbed = new MessageEmbed()
    .setTitle(`New Moderation Action Executed Towards You`)
    .setDescription(
      `**Moderator**: \`${interaction.user.tag}\` (${
        interaction.user.id
      })\n**Action**: ${Action}\n${duration}**Reason**: ${Reason}\n**Link**: [Click here](${getLink(
        interaction
      )})`
    )
    .setColor(Color)
    .setFooter({
      text: `Case #${docs.CaseCount}`,
    })
    .setTimestamp();

  await Member?.send({
    embeds: [dmEmbed],
  }).catch((error) => console.error(error));
}
