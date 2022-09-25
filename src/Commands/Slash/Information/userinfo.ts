import { Command } from '../../../structures/Command';
import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  UserFlags,
} from 'discord.js';
import 'dotenv/config';
import { listRoles } from '../../../utils/functions/listRoles';

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
    await target.fetch();
    await target.fetchFlags();
    const isMember = interaction.guild.members.cache.get(target.id);

    const statusType = {
      idle: '<:idle:1023574537708769350>',
      dnd: '<:dnd:1023574534386896936>',
      online: '<:online:1023574536089767946>',
      invisible: '<:offline:1023574532155519006>',
    };

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
          target.bannerURL() ||
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
                statusType[isMember.presence?.status || 'invisible']
              }\n**Activity**: ${
                isMember.presence?.activities[1] || 'None'
              }\n**Roles**: ${listRoles({ member: isMember })}`
            : ''
        }\n**Link**: [Click here ›](https://lookup.guru/${target.id})`
      )
      .setImage(
        target.bannerURL({ size: 4096 }) ||
          `https://singlecolorimage.com/get/${target.hexAccentColor?.slice(
            1
          )}/600x240` ||
          null
      );

    interaction.editReply({
      embeds: [embed],
    });
  },
});
