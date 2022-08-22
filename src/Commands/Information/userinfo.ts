import { Command } from '../../structures/Command';
import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  UserFlags,
  AttachmentBuilder,
} from 'discord.js';
import 'dotenv/config';
import { listRoles } from '../../utils/functions/listRoles';
import { getUserBanner } from '../../utils/functions/getUserBanner';

export default new Command({
  name: 'userinfo',
  description: 'Displays detailed information about a user',
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionType.User,
      description: 'User to lookup information on',
      required: false,
    },
  ],
  timeout: 5000,
  run: async ({ interaction, args }) => {
    await interaction.deferReply();
    const target = args.getUser('user') || interaction.user;
    const isMember = interaction.guild.members.cache.get(target.id);
    const banner: string = await getUserBanner({ user: target });
    const embed = new EmbedBuilder()
      .setTitle(
        `${target.username}${
          target.username.endsWith('s') ? "'" : "'s"
        } User Information`
      )
      .setColor('#ea664b')
      .setThumbnail(target.displayAvatarURL())
      .setFooter({ text: `ID: ${target.id}` })
      .setDescription(
        `${
          target.flags.has(UserFlags.CertifiedModerator)
            ? '<:certifiied_moderator:998581289370271764>'
            : ''
        } ${
          target.flags.has(UserFlags.Hypesquad)
            ? '<:hypesquad_events:998581293338067054>'
            : ''
        } ${
          target.flags.has(UserFlags.HypeSquadOnlineHouse1)
            ? '<:hypesquad_bravery:998581300342575185>'
            : ''
        } ${
          target.flags.has(UserFlags.HypeSquadOnlineHouse2)
            ? '<:hypesquad_brilliance:998581291828138014>'
            : ''
        } ${
          target.flags.has(UserFlags.HypeSquadOnlineHouse3)
            ? '<:hypesquad_balance:998581297817583686>'
            : ''
        } ${
          target.flags.has(UserFlags.PremiumEarlySupporter)
            ? '<:early_supporter:998583447461298276>'
            : ''
        } ${
          target.displayAvatarURL().endsWith('.gif') ||
          (await getUserBanner({ user: target })) ||
          target.discriminator === '0001'
            ? '<:nitro:998584423433908224>'
            : ''
        } ${
          isMember?.premiumSince ? '<:booster:998584842121904198>' : ''
        }\n\n**Tag**: \`${target.tag}\`\n**Account Created**: <t:${Math.floor(
          target.createdTimestamp / 1000
        )}> (<t:${Math.floor(target.createdTimestamp / 1000)}:R>)${
          isMember
            ? `\n**Joined the Server**: <t:${Math.floor(
                isMember.joinedTimestamp / 1000
              )}> (<t:${Math.floor(
                isMember.joinedTimestamp / 1000
              )}:R>)\n**Status**: ${
                isMember.presence?.status
                  .replace('dnd', 'Do Not Disturb')
                  .replace('online', 'Online')
                  .replace('idle', 'Idle')
                  .replace('offline', 'Offline') || 'Offline'
              }\n**Game**: ${
                isMember.presence?.activities[1] || 'None'
              }\n**Roles**: ${listRoles({ member: isMember })}`
            : ''
        }`
      )
      .setImage(banner || null);

    interaction.editReply({
      embeds: [embed],
    });
  },
});
