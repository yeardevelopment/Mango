import { Event } from '../structures/Event';
import { client } from '..';
import { EmbedBuilder, PermissionsBitField } from 'discord.js';
import { capitalizeWords } from '../utils/functions/capitalizeWords';

export default new Event('interactionCreate', async (interaction) => {
  if (!interaction.guild) return;
  if (!interaction.isButton()) return;

  const button = client.buttons.get(interaction.customId);
  if (!button)
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Unable to execute the button`,
            iconURL: 'https://i.imgur.com/n3QHYJM.png',
          })
          .setDescription(
            `An error occurred while trying to execute the button`
          )
          .setColor('#2F3136'),
      ],
      ephemeral: true,
    });

  if (
    button.permissions &&
    !(interaction.member.permissions as PermissionsBitField).has(
      button.permissions
    )
  )
    return interaction.reply({
      content: `**✋ Hold on!**\nYou need to have \`${capitalizeWords({
        string: (button.permissions as string)
          .replaceAll(/([A-Z])/g, ' $1')
          .toLowerCase()
          .replaceAll('guild', 'server')
          .substring(1),
      })}\` permission to use this button.`,
      ephemeral: true,
    });

  if (button.ownerOnly) {
    if (!(await client.config).owners.includes(interaction.user.id))
      return interaction.reply({
        content: '⚠️ You cannot use this button.',
        ephemeral: true,
      });
  }

  button.run({ interaction, client });
});
