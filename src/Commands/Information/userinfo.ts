import { Command } from '../../structures/Command';
import Discord, {
  GuildMember,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import axios from 'axios';
import 'dotenv/config';
import { listRoles } from '../../utils/functions/listRoles';
import { getUserBanner } from '../../utils/functions/getUserBanner';

export default new Command({
  name: 'userinfo',
  description: 'Displays detailed information about a user',
  type: 'CHAT_INPUT',
  options: [
    {
      name: 'user',
      type: 'USER',
      description: 'User to lookup information on',
      required: false,
    },
  ],
  timeout: 5000,
  run: async ({ interaction, args }) => {
    const target = args.getUser('user') || interaction.user;
    const isMember = interaction.guild.members.cache.get(target.id);
    const banner: string = await getUserBanner(target);
    const embed = new MessageEmbed()
      .setTitle(
        `${target.username}${
          target.username.endsWith('s') ? "'" : "'s"
        } User Information`
      )
      .setColor('#ea664b')
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `ID: ${target.id}` })
      .setDescription(
        `**Tag**: \`${target.tag}\`\n**Account Created**: <t:${Math.floor(
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
              }\n**Roles**: ${listRoles(isMember)}`
            : ''
        }`
      )
      .setImage(banner);

    interaction.reply({
      embeds: [embed],
    });
  },
});
