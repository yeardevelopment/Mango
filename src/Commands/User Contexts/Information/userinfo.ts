import { UserContext } from '../../../structures/UserContext';
import { EmbedBuilder, UserFlags, ApplicationCommandType } from 'discord.js';
import { listRoles } from '../../../utils/functions/listRoles';

export default new UserContext({
  name: 'User Information',
  type: ApplicationCommandType.User,
  timeout: 5000,
  run: async ({ interaction }) => {
    await interaction.deferReply({ ephemeral: true });
    const target = interaction.targetUser;
    await target.fetch();
    const isMember = interaction.guild.members.cache.get(target.id);

    const statusType = {
      idle: 'Idle',
      dnd: 'Do Not Disturb',
      online: 'Online',
      invisible: 'Offline',
    };

    const flags = {
      CertifiedModerator: '<:certifiied_moderator:998581289370271764>',
      Hypesquad: '<:hypesquad_events:998581293338067054>',
      HypeSquadOnlineHouse1: '<:hypesquad_bravery:998581300342575185>',
      HypeSquadOnlineHouse2: '<:hypesquad_brilliance:998581291828138014>',
      HypeSquadOnlineHouse3: '<:hypesquad_balance:998581297817583686>',
      PremiumEarlySupporter: '<:early_supporter:998583447461298276>',
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
          target.flags.toArray().length
            ? target.flags.toArray().map((flag) => `${flags[flag]} `)
            : 'None'
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
              }\n**Activities**: ${
                isMember.presence?.activities
                  .map((activity) => activity.name)
                  .join(', ') || 'None'
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
