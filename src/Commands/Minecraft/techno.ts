import { Command } from '../../structures/Command';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  EmbedBuilder,
  AttachmentBuilder,
} from 'discord.js';
import { getSkin } from 'mc-names';
import request from 'request';
import { loadImage, createCanvas } from 'canvas';
import { join } from 'path';

export default new Command({
  name: 'techno',
  description:
    "Adds Technoblade's Crown or Coat on your Minecraft skin as a tribute",
  options: [
    {
      name: 'username',
      type: ApplicationCommandOptionType.String,
      description: 'Player whose skin to be modified',
      required: true,
      min_length: 1,
      max_length: 16,
    },
    {
      name: 'option',
      type: ApplicationCommandOptionType.String,
      description: 'Add crown, coat or both?',
      choices: [
        { name: 'crown', value: 'crown' },
        { name: 'coat', value: 'coat' },
        { name: 'both', value: 'both' },
      ],
      required: true,
    },
  ],
  timeout: 10000,
  run: async ({ interaction, args }) => {
    const username = args.getString('username');

    if (!username)
      return interaction.reply({
        content: `⚠ You must reply with a valid Minecraft username.`,
        ephemeral: true,
      });
    if (username.length > 16)
      interaction.reply({
        content: `⚠ Minecraft username cannot be longer than 16 characters.`,
        ephemeral: true,
      });
    if (username.includes(' '))
      interaction.reply({
        content: `⚠ Minecraft username cannot include spaces.`,
        ephemeral: true,
      });

    const uuidURL = `https://api.mojang.com/users/profiles/minecraft/${username}`;

    request(uuidURL, async function (err, response, body): Promise<any> {
      if (err) {
        return interaction.reply({
          content: `⚠ There is no Minecraft player with that username.`,
          ephemeral: true,
        });
      }
      try {
        body = JSON.parse(body);
        let player_name: string = body.name;

        const skin = await loadImage(
          `https://mc-heads.net/skin/${player_name}.png`
        );
        const crown = await loadImage(
          join(__dirname, `../../../Images/crown.png`)
        );
        const coat = await loadImage(
          join(__dirname, `../../../Images/coat.png`)
        );

        const canvas = createCanvas(64, 64);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(skin, 0, 0, 64, 64);

        switch (args.getString('option')) {
          case 'crown': {
            ctx.drawImage(crown, 0, 0, 64, 64);
            break;
          }
          case 'coat': {
            ctx.drawImage(coat, 0, 0, 64, 64);
            break;
          }
          case 'both': {
            ctx.drawImage(coat, 0, 0, 64, 64);
            ctx.drawImage(crown, 0, 0, 64, 64);
            break;
          }
        }

        const embed = new EmbedBuilder()
          .setTitle(`Successfully Technobladed Your Skin`)
          .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription(
            `You can apply this skin to your account by going to [your Minecraft Profile](https://www.minecraft.net/en-us/msaprofile/mygames/editskin) and uploading the image below.`
          )
          .setImage('attachment://modified.png')
          .setColor('#ea664b')
          .setFooter({ text: `Minecraft Username: ${player_name}` });

        const attachment = new AttachmentBuilder(canvas.toBuffer(), {
          name: 'modified.png',
        });
        interaction.reply({
          embeds: [embed],
          files: [attachment],
        });
      } catch (error) {
        console.error(error);
        interaction.reply({
          content: `⚠ An error occurred while trying to generate this skin.`,
          ephemeral: true,
        });
      }
    });
  },
});
