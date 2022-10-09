import {
  Collection,
  EmbedBuilder,
  PermissionsBitField,
  CommandInteraction,
} from 'discord.js';
import ms from 'ms';
import chalk from 'chalk';
const Timeout = new Collection();
import { client } from '..';
import { Event } from '../structures/Event';
import { ExtendedInteraction } from '../typings/UserContext';
import premiumGuilds from '../utils/models/premiumGuilds';
import { capitalizeWords } from '../utils/functions/capitalizeWords';
import errors from '../utils/models/errors';

export default new Event('interactionCreate', async (interaction) => {
  if (!interaction.guild) return; // Interactions can only be called used within a guild
  if (!interaction.isUserContextMenuCommand()) return;

  const context = client.userContexts.get(interaction.commandName);
  if (!context)
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Unable to execute the command`,
            iconURL: 'https://i.imgur.com/n3QHYJM.png',
          })
          .setDescription(
            `An error occurred while trying to execute the command`
          )
          .setColor('#ff0000'),
      ],
      ephemeral: true,
    });

  if (context.ownerOnly) {
    if (!(await client.config).owners.includes(interaction.user.id))
      return interaction.reply({
        content: '⚠️ You cannot use this command.',
        ephemeral: true,
      });
  }

  if (context.premiumOnly) {
    const data = await premiumGuilds.findOne({ Guild: interaction.guildId });
    if (Date.now() > data.Expire) {
      data.delete();
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('This is a Mango Premium command')
            .setDescription(
              'This command only works within servers that are subscribed to Mango Premium. You can ask owners to subscribe to it.'
            )
            .setColor('#ff0000'),
        ],
      });
    }
  }

  if (
    context.permissions &&
    !(interaction.member.permissions as PermissionsBitField).has(
      context.permissions
    )
  )
    return interaction.reply({
      content: `**✋ Hold on!**\nYou need to have \`${capitalizeWords({
        string: (context.permissions as string)
          .replaceAll(/([A-Z])/g, ' $1')
          .toLowerCase()
          .replaceAll('guild', 'server')
          .substring(1),
      })}\` permission to use this command.`,
      ephemeral: true,
    });

  if (context.timeout) {
    if (Timeout.has(`${context.name}${interaction.user.id}`))
      return await interaction.reply({
        content: `**🛑 Chill there!**\nYou are on a \`${ms(
          (Timeout.get(`${context.name}${interaction.user.id}`) as number) -
            Date.now(),
          { long: true }
        )}\` cooldown.`,
        ephemeral: true,
      });
  }

  try {
    context.run({
      client,
      interaction: interaction as ExtendedInteraction,
    });
    console.log(
      `${interaction.user.tag} (${
        interaction.user.id
      }) executed ${chalk.bold.green(context.name)}. Interaction ID: ${
        interaction.id
      }`
    );
    Timeout.set(
      `${context.name}${interaction.user.id}`,
      Date.now() + context.timeout
    );
    setTimeout(() => {
      Timeout.delete(`${context.name}${interaction.user.id}`);
    }, context.timeout);
  } catch (error) {
    await saveError({ error, interaction });
  }
});

async function saveError({
  error,
  interaction,
}: {
  error: any;
  interaction: CommandInteraction;
}) {
  await errors
    .create({ Error: error, User: interaction.user.id })
    .then((document) => {
      if (interaction.replied) {
        interaction.editReply({
          content: null,
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: 'Error Occurred',
                iconURL: 'https://i.imgur.com/n3QHYJM.png',
              })
              .setDescription(
                `There was an error executing the interaction. Please [contact us](https://discord.gg/QeKcwprdCY) with this error ID: \`${document.id}\`.`
              ),
          ],
        });
      } else {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: 'Error Occurred',
                iconURL: 'https://i.imgur.com/n3QHYJM.png',
              })
              .setDescription(
                `There was an error executing the interaction. Please [contact us](https://discord.gg/QeKcwprdCY) with the following error ID: \`${document.id}\`.`
              ),
          ],
        });
      }
    });
}
