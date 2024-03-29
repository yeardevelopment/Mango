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

import { Command } from '../../../structures/Command';
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  AttachmentBuilder,
} from 'discord.js';
import { loadImage, createCanvas } from 'canvas';
import { join } from 'path';
import axios from 'axios';

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
  timeout: 5000,
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

    try {
      const response = await axios.get(uuidURL);
      const data = response.data;
      let player_name: string = data.name;

      const skin = await loadImage(
        `https://mc-heads.net/skin/${player_name}.png`
      );
      const crown = await loadImage(
        join(__dirname, `../../../../assets/Images/crown.png`)
      );
      const coat = await loadImage(
        join(__dirname, `../../../../assets/Images/coat.png`)
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
        .setImage('attachment://technobladed.png')
        .setColor('#ea664b')
        .setFooter({ text: `Minecraft Username: ${player_name}` });

      const attachment = new AttachmentBuilder(canvas.toBuffer(), {
        name: 'technobladed.png',
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
  },
});
