import { Event } from '../structures/Event';
import { client } from '..';
import { EmbedBuilder } from 'discord.js';

export default new Event('interactionCreate', async (interaction) => {
  if (!interaction.guild) return;
  if (!interaction.isModalSubmit()) return;

  const modal = client.modals.get(interaction.customId);
  if (!modal)
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Unable to execute the modal`,
            iconURL: 'https://i.imgur.com/n3QHYJM.png',
          })
          .setDescription(`An error occurred while trying to execute the modal`)
          .setColor('#ff0000'),
      ],
      ephemeral: true,
    });

  modal.run({ interaction, client });
});
