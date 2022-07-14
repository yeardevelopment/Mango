// import { Command } from '../../structures/Command';
// import Discord, { Interaction, Message, MessageEmbedFooter } from 'discord.js';
// import { modlogs } from '../../utils/functions/modLogs';

// export default new Command({
//   name: 'ban',
//   description:
//     'Suspends a member of this server from joining back on the specified account',
//   type: 'CHAT_INPUT',
//   options: [
//     {
//       name: 'member',
//       type: 'USER',
//       description: 'Member to be suspended from joining back',
//       required: true,
//     },
//     {
//       name: 'messages',
//       type: 'INTEGER',
//       description: "Whether to delete member's messages or not",
//       required: true,
//       choices: [
//         { name: 'Do not delete any messages.', value: 0 },
//         { name: 'Delete messages sent in previous 24 hours.', value: 1 },
//         { name: 'Delete messages sent in previous 7 days.', value: 7 },
//       ],
//     },
//     {
//       name: 'reason',
//       type: 'STRING',
//       description: 'Reason for this action',
//       required: false,
//     },
//   ],
//   timeout: 10000,
//   run: async ({ interaction, client, args }) => {
//     let target = args.getUser('member');
//     let amount = args.getInteger('messages');

//     interaction.guild.bans.fetch().then(async (bans) => {
//       let banned = bans.find((ban) => ban.user.id == target.id);
//       if (banned)
//         return interaction.reply({
//           content: '⚠ The user is already banned.',
//           ephemeral: true,
//         });
//     });

//     const isMember = interaction.guild.members.cache.get(target.id);
//     if (isMember && isMember.roles.highest >= interaction.member.roles.highest)
//       return interaction.reply({
//         content: '⚠ You do not have enough permissions to ban the member.',
//         ephemeral: true,
//       });

//     if (target.id === interaction.user.id) {
//       return interaction.reply({
//         content: '⚠ You cannot ban yourself.',
//         ephemeral: true,
//       });
//     }
//     if (target.id === client.user.id) {
//       return interaction.reply({
//         content: '⚠ You cannot ban the bot.',
//         ephemeral: true,
//       });
//     }

//     let reason = args.getString('reason');

//     if (!reason) reason = 'No reason provided.';

//     let proceedButton = new Discord.MessageButton()
//       .setStyle(`SUCCESS`)
//       .setEmoji(`996733680422752347`)
//       .setLabel(`Proceed`)
//       .setCustomId('proceed');
//     let cancelButton = new Discord.MessageButton()
//       .setStyle('DANGER')
//       .setEmoji(`996733678279462932`)
//       .setLabel(`Cancel`)
//       .setCustomId('back');
//     let row = new Discord.MessageActionRow().addComponents([
//       proceedButton,
//       cancelButton,
//     ]);
//     const confirmation = await interaction.reply({
//       content: `${interaction.user}`,
//       embeds: [
//         new Discord.MessageEmbed()
//           .setTitle(`⚠ Are you sure?`)
//           .setColor('RED')
//           .setDescription(
//             `Are you sure you want to ban **${target.tag}** with reason: \`${reason}\`?\nThis action will be automatically canceled in 10 seconds if you do not select any option.`
//           )
//           .setFooter({
//             text: interaction.guild.name,
//             iconURL: interaction.guild.iconURL({ dynamic: true }),
//           }),
//       ],
//       fetchReply: true,
//       components: [row],
//     });
//     const filter = (inter) => inter.user.id === interaction.user.id;
//     const collector = (confirmation as Message).createMessageComponentCollector(
//       {
//         filter,
//         time: 10000,
//         max: 1,
//       }
//     );

//     collector.on('collect', async (interaction) => {
//       if (interaction.customId === 'proceed') {
//         await interaction.deferReply();
//         await interaction.followUp({
//           content: `**🔨 ${interaction.user.tag}** banned **${target.tag}**.\nReason: *${reason}*`,
//         });
//         await modlogs(
//           {
//             Member: target,
//             Action: 'Ban',
//             Reason: reason,
//             Color: 'RED',
//           },
//           interaction
//         );
//         await interaction.guild.bans
//           .create(target.id, {
//             days: amount,
//             reason: `Banned by ${interaction.user.tag} | Reason: ${reason}`,
//           })
//           .catch((error) => console.error(error));
//       }
//       if (interaction.customId === 'back') {
//         return interaction.message.delete();
//       }
//     });

//     collector.on('end', async (interaction) => {
//       let row = new Discord.MessageActionRow().addComponents([
//         proceedButton.setDisabled(),
//         cancelButton.setDisabled(),
//       ]);
//       (confirmation as Message).edit({
//         embeds: [
//           new Discord.MessageEmbed()
//             .setTitle(`⚠ Are you sure?`)
//             .setColor('RED')
//             .setDescription(
//               `Are you sure you want to ban **${target.tag}** with reason: \`${reason}\`?\nThis action will be automatically canceled in 10 seconds if you do not select any option.`
//             )
//             .setFooter({
//               text: `${
//                 (confirmation.embeds[0].footer as MessageEmbedFooter).text
//               }`,
//               iconURL: (confirmation.embeds[0].footer as MessageEmbedFooter)
//                 .iconURL,
//             }),
//         ],
//         components: [row],
//       });
//     });
//   },
// });
