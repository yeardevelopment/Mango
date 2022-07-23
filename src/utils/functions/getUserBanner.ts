import { User } from 'discord.js';
import axios from 'axios';
import 'dotenv/config';

export async function getUserBanner(user: User): Promise<string> {
  let url: string;
  await axios
    .get(`https://discord.com/api/users/${user.id}`, {
      headers: {
        Authorization: `Bot ${process.env.TOKEN}`,
      },
    })
    .then((response) => {
      const { banner } = response.data;

      if (banner) {
        const extension = banner.startsWith('a_') ? '.gif' : '.png';
        url = `https://cdn.discordapp.com/banners/${user.id}/${banner}${extension}?size=4096`;
      }
    });

  return url;
}
