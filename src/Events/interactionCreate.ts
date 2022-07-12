import Discord, {
  Collection,
  CommandInteractionOptionResolver,
} from 'discord.js';
import ms from 'ms';
import chalk from 'chalk';
const Timeout = new Collection();
import { client } from '..';
import { Event } from '../structures/Event';
import { ExtendedInteraction } from '../typings/Command';

export default new Event('interactionCreate', async (interaction) => {
  if (!interaction.guild) return; // Interactions can only be called used within a guild

  if (interaction.isCommand()) {
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
            .setColor('RED'),
        ],
        ephemeral: true,
      });

    if (command.timeout) {
      if (Timeout.has(`${command.name}${interaction.user.id}`))
        return await interaction.reply({
          content: `**:stop_sign: Chill there!**\nYou are on a \`${ms(
            (Timeout.get(`${command.name}${interaction.user.id}`) as number) -
              Date.now(),
            { long: true }
          )}\` cooldown.`,
          ephemeral: true,
        });
    }
    try {
      command.run({
        args: interaction.options as CommandInteractionOptionResolver,
        client,
        interaction: interaction as ExtendedInteraction,
      });
      console.log(
        `${interaction.user.tag} (${
          interaction.user.id
        }) executed ${chalk.bold.green(command.name)}. Interaction ID: ${
          interaction.id
        }`
      );
      Timeout.set(
        `${command.name}${interaction.user.id}`,
        Date.now() + command.timeout
      );
      setTimeout(() => {
        Timeout.delete(`${command.name}${interaction.user.id}`);
      }, command.timeout);
    } catch (error) {
      console.error(error);
    }
  }
});
