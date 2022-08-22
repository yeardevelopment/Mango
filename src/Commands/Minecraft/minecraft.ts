import { Command } from '../../structures/Command';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import request from 'request';
import { Account, getNameHistory, getSkin } from 'mc-names';
import * as MC from 'minecraft-server-util';

export default new Command({
  name: 'minecraft',
  description: 'Minecraft commands manager',
  options: [
    {
      name: 'skin',
      type: ApplicationCommandOptionType.Subcommand,
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
    },
    {
      name: 'server',
      type: ApplicationCommandOptionType.Subcommand,
      description: 'Displays necessary information about the Minecraft server',
      options: [
        {
          name: 'ip',
          type: ApplicationCommandOptionType.String,
          description: 'IP address of the Minecraft Server',
          required: true,
        },
        {
          name: 'port',
          type: ApplicationCommandOptionType.Integer,
          description: 'Port of the Minecraft Server',
          required: true,
        },
      ],
    },
    {
      name: 'name-history',
      type: ApplicationCommandOptionType.Subcommand,
      description: "Displays player's nickname history",
      options: [
        {
          name: 'nickname',
          type: ApplicationCommandOptionType.String,
          description: 'Player whose name history to be displayed',
          required: true,
          min_length: 1,
          max_length: 16,
        },
      ],
    },
  ],
  timeout: 10000,
  run: async ({ interaction, client, args }) => {
    switch (args.getSubcommand()) {
      case 'skin': {
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

        request(uuidURL, async (err, response, body): Promise<any> => {
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
              .setThumbnail(skin.head)
              .setDescription(
                `[Download](https://crafatar.com/skins/${player_id}.png)`
              )
              .setColor('#ea664b');

            const button = new ButtonBuilder()
              .setStyle(ButtonStyle.Link)
              .setLabel('NameMC')
              .setEmoji({ name: 'namemc', id: '998590285942624399' })
              .setURL(`https://namemc.com/profile/${username}`);

            const row = new ActionRowBuilder().addComponents([button]);

            await interaction.reply({
              embeds: [embed],
              components: [row as ActionRowBuilder<ButtonBuilder>],
            });
          } catch (error) {
            console.error(error);
            await interaction.reply({
              content: `⚠ There is no Minecraft player with that nickname.`,
              ephemeral: true,
            });
          }
        });
        break;
      }

      case 'server': {
        const ip = args.getString('ip');
        const port = args.getInteger('port');

        MC.status(ip, port)
          .then((response) => {
            interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor('#ea664b')
                  .setTitle('Minecraft Server Information')
                  .setDescription(
                    `**Server IP**: \`${ip}\`\n**Server Port**: \`${port}\`\n**Server MOTD**: ${response.motd.clean}\n**Server Players Count**: \`${response.players.online}\`\n**Server Players Limit**: \`${response.players.max}\`\n**Server Version**: \`${response.version.name}\``
                  ),
              ],
            });
          })
          .catch((error) => {
            interaction.reply({
              content: '⚠️ Could not find information about the server.',
              ephemeral: true,
            });
          });
        break;
      }

      case 'name-history': {
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

        request(uuidURL, async (err, response, body): Promise<any> => {
          if (err) {
            return interaction.reply({
              content: `⚠ There is no Minecraft player with that nickname.`,
              ephemeral: true,
            });
          }

          try {
            const history = await getNameHistory(username);

            const embed = new EmbedBuilder()
              .setTitle('Minecraft Name History')
              .setDescription(
                String(
                  (history as Account).history.map((name) => `${name}\n`)
                ).replaceAll(',', '')
              )
              .setColor('#ea664b');

            const button = new ButtonBuilder()
              .setStyle(ButtonStyle.Link)
              .setLabel('NameMC')
              .setEmoji({ name: 'namemc', id: '998590285942624399' })
              .setURL(`https://namemc.com/profile/${username}`);

            const row = new ActionRowBuilder().addComponents([button]);

            await interaction.reply({
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
        break;
      }
    }
  },
});
