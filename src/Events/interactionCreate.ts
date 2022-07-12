import { CommandInteractionOptionResolver } from 'discord.js';
import * as Discord from 'discord.js';
import { client } from '..';
import { Event } from '../structures/Event';
import { ExtendedInteraction } from '../typings/Command';

export default new Event('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    await interaction.deferReply();
    const command = client.commands.get(interaction.commandName);
    if (!command)
      return interaction.reply({
        embeds: [
          new Discord.MessageEmbed()
            .setAuthor({
              name: `Unable to execute the command`,
              iconURL: `https://i.imgur.com/n3QHYJM.png`,
            })
            .setDescription(
              `An error occurred while trying to execute the command`
            )
            .setColor('#2F3136'),
        ],
      });

    command.run({
      args: interaction.options as CommandInteractionOptionResolver,
      client,
      interaction: interaction as ExtendedInteraction,
    });
  }
});
