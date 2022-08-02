import { Command } from '../../structures/Command';
import Discord, { EmbedBuilder } from 'discord.js';
import axios from 'axios';

export default new Command({
  name: 'dadjoke',
  description: 'Displays a random dad joke 👨',
  timeout: 5000,
  run: async ({ interaction, client }) => {
    const options = {
      method: 'GET',
      url: 'https://icanhazdadjoke.com/',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Discord Bot (https://github.com/eightless/Mango)',
      },
    };

    const response = await axios.request(options);

    interaction.reply({
      content: `👨 ${response.data.joke}`,
    });
  },
});
