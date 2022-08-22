import { Command } from '../../structures/Command';
import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  UserFlags,
  AttachmentBuilder,
  Role,
  PermissionsBitField,
  PermissionsString,
} from 'discord.js';
import 'dotenv/config';
import { capitalizeWords } from '../../utils/functions/capitalizeWords';

export default new Command({
  name: 'roleinfo',
  description: 'Displays necessary information about a role',
  options: [
    {
      name: 'role',
      type: ApplicationCommandOptionType.Role,
      description: 'Role to lookup information on',
      required: true,
    },
  ],
  timeout: 5000,
  run: async ({ interaction, args }) => {
    await interaction.deferReply();
    await interaction.guild.members.fetch();
    let target = args.getRole('role');

    const mentionable = (target as Role).mentionable !== true ? 'No' : 'Yes';
    const hoisted = (target as Role).hoist !== true ? 'No' : 'Yes';
    const managed = (target as Role).editable !== true ? 'No' : 'Yes';

    let color = '';
    if ((target as Role).hexColor === '#000000') color = 'None';
    if ((target as Role).hexColor !== '#000000')
      color = (target as Role).hexColor;

    let itemToBeRemoved: PermissionsString[] = [
      'Administrator',
      'KickMembers',
      'BanMembers',
      'ManageGuild',
      'ManageChannels',
      'ManageNicknames',
      'ManageRoles',
      'ManageWebhooks',
      'ManageEvents',
      'ManageEmojisAndStickers',
      'ManageMessages',
      'ModerateMembers',
      'MentionEveryone',
    ];
    let myArray = (target.permissions as PermissionsBitField).toArray();
    let fArr = myArray.filter((item) => itemToBeRemoved.includes(item));

    const icon = !target.icon
      ? 'None'
      : `[Click here](${(target as Role).iconURL()})`;

    const embed = new EmbedBuilder()
      .setTitle(`Role Information`)
      .setDescription(
        `**Name**: ${
          (target as Role).name
        }\n**HEX Color**: ${color}\n**Role Icon**: ${icon}\n**Position**: ${
          (target as Role).position
        }\n**Hoisted**: ${hoisted}\n**Mentionable**: ${mentionable}\n**Users in Role**: ${
          (target as Role).members.size
        }\n**Role Created**: <t:${Math.floor(
          (target as Role).createdTimestamp / 1000
        )}> (<t:${Math.floor(
          (target as Role).createdTimestamp / 1000
        )}:R>)\n**Key Permissions**: ${
          capitalizeWords({
            string: fArr
              .sort()
              .join(', ')
              .replaceAll(/([A-Z])/g, ' $1')
              .toLowerCase()
              .replaceAll('guild', 'server'),
          }) || 'None'
        }`
      )
      .setFooter({ text: `ID: ${(target as Role).id}` })
      .setColor('#ea664b');

    interaction.editReply({
      embeds: [embed],
    });
  },
});
