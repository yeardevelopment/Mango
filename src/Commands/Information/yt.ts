// import { ApplicationCommandOptionType } from 'discord.js';
// import { Command } from '../../structures/Command';
// import { EmbedBuilder } from 'discord.js';
// import axios from 'axios';

// export default new Command({
//   name: 'youtube',
//   description: 'Replies with YouTube channel info',
//   options: [
//     {
//       name: 'channel',
//       type: ApplicationCommandOptionType.String,
//       description: 'The channel you would like to search for',
//       required: true,
//     },
//   ],
//   timeout: 5000,
//   run: async ({ interaction, args }) => {
//     const channel = args.getString('channel');

//     const check = await axios.get(
//       `https://youtube.googleapis.com/youtube/v3/search?part=snippet&key=${process.env.YT_KEY}&q=${channel}&type=channel&maxResults=1`
//     );
//     const item = check['items'];
//     if (item === null) {
//       return interaction.reply({
//         content: 'This channel is invalid.',
//         ephemeral: true,
//       });
//     } else {
//       try {
//         await axios
//           .get(
//             `https://youtube.googleapis.com/youtube/v3/search?part=snippet&key=${process.env.YT_KEY}&q=${channel}&type=channel&maxResults=1`
//           )
//           .then((response) => {
//             return response;
//           })
//           .then(async (data) => {
//             const channelId = data['items'][0].snippet.channelId;
//             const channelName = data['items'][0].snippet.title;
//             const pfp = data['items'][0].snippet.thumbnails.high.url;

//             await axios
//               .get(
//                 `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${process.env.YT_KEY}`
//               )
//               .then((response) => {
//                 return response;
//               })
//               .then(async (data) => {
//                 const embed = new EmbedBuilder()
//                   .setTitle(
//                     `${channelName}${
//                       channelName.endsWith('s') ? "'" : "'s"
//                     } channel data`
//                   )
//                   .setAuthor({
//                     name: interaction.user.username,
//                     iconURL: interaction.user.displayAvatarURL(),
//                   })
//                   .setDescription(
//                     `**Name: **${channelName}\n**Subcount: **${
//                       data[`items`][0].statistics.subscriberCount
//                     }\n**Viewcount: **${
//                       data[`items`][0].statistics.viewCount
//                     }\n**Videocount: **${
//                       data[`items`][0].statistics.videoCount
//                     }`
//                   )
//                   .setThumbnail(pfp)
//                   .setColor('#717289');

//                 await axios(
//                   `https://www.googleapis.com/youtube/v3/channels?part=brandingSettings&id=${channelId}&key=${process.env.YT_KEY}`
//                 )
//                   .then((response) => {
//                     return response;
//                   })
//                   .then((data) => {
//                     embed.setImage(
//                       data['items'][0].brandingSettings.image.bannerExternalUrl
//                     );
//                   });

//                 return interaction.reply({
//                   embeds: [embed],
//                 });
//               });
//           });
//       } catch (error) {
//         console.log(error);
//         return interaction.reply({
//           content: "There was an error while fetching this channel's data",
//           ephemeral: true,
//         });
//       }
//     }
//   },
// });
