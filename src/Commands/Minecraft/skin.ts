import { Command } from '../../structures/Command';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import { getSkin } from 'mc-names';
import request from 'request';

export default new Command({
  name: 'skin',
  description: 'Displays the skin of a Minecraft player',
  options: [
    {
      name: 'nickname',
      type: ApplicationCommandOptionType.String,
      description: 'Player whose skin to be displayed',
      required: true,
      min_length: 1,
      max_length: 16,
    },
  ],
  timeout: 10000,
  run: async ({ interaction, args }) => {
    const username = args.getString('nickname');
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

    const uuidURL = `https://api.mojang.com/users/profiles/minecraft/${username}`;

    request(uuidURL, async function (err, response, body): Promise<any> {
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
        let player_name: string = body.name;

        const embed = new EmbedBuilder()
          .setTitle(player_name)
          .setImage(skin.render)
          .setDescription(
            `[Download](https://crafatar.com/skins/${player_id}.png)`
          )
          .setColor('#2F3136');

        const button = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel('NameMC')
          .setEmoji({ name: 'namemc', id: '998590285942624399' })
          .setURL(`https://namemc.com/profile/${username}`);

        const row = new ActionRowBuilder().addComponents([button]);

        interaction.reply({
          embeds: [embed],
          components: [row as ActionRowBuilder<ButtonBuilder>],
        });
      } catch (error) {
        console.error(error);
        interaction.reply({
          content: `⚠ There is no Minecraft player with that nickname.`,
          ephemeral: true,
        });
      }
    });
  },
});
