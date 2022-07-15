import { Command } from '../../structures/Command';
import Discord, {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import { getSkin } from 'mc-names';
import request from 'request';

export default new Command({
  name: 'skin',
  description: 'Displays the skin of a Minecraft player',
  options: [
    {
      name: 'nickname',
      type: 'STRING',
      description: 'Member whose skin to be displayed',
      required: true,
    },
  ],
  timeout: 10000,
  run: async ({ interaction }) => {
    const username = interaction.options.getString('nickname');
    if (username.length > 16)
      interaction.reply({
        content: `⚠ Minecraft nickname cannot be longer than 16 characters.`,
        ephemeral: true,
      });
    if (username.includes(' '))
      interaction.reply({
        content: `⚠ Minecraft nickname cannot include spaces.`,
        ephemeral: true,
      });

    const uuidURL =
      'https://api.mojang.com/users/profiles/minecraft/' + username;

    request(uuidURL, async function (err, resp, body) {
      if (err) {
        return interaction.reply({
          content: `⚠ There is no Minecraft player with that nickname.`,
          ephemeral: true,
        });
      }

      try {
        body = JSON.parse(body);
        const skin = await getSkin(username);
        let player_id = body.id;
        let player_name = body.name;

        const embed = new MessageEmbed()
          .setTitle(`${player_name}`)
          .setImage(skin.render)
          .setDescription(
            `[Download](https://crafatar.com/skins/${player_id}.png)`
          )
          .setColor('#2F3136');

        const button = new MessageButton()
          .setStyle('LINK')
          .setLabel('NameMC')
          .setEmoji('960962950858952754')
          .setURL(`https://namemc.com/profile/${username}`);

        const row = new MessageActionRow().addComponents([button]);

        interaction.reply({
          embeds: [embed],
          components: [row],
        });
      } catch (error) {
        console.error(error);
        return interaction.reply({
          content: `⚠ There is no Minecraft player with that nickname.`,
          ephemeral: true,
        });
      }
    });
  },
});
