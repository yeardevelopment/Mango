import { Command } from '../../../structures/Command';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default new Command({
  name: 'support',
  description: 'Join the official Mango Support Server',
  timeout: 5000,
  run: async ({ interaction }) => {
    interaction.reply({
      content:
        'Click the button below to join the official Mango support server.',
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('Support Server')
            .setEmoji({ name: 'support', id: '996734485120962591' })
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.gg/QeKcwprdCY'),
          new ButtonBuilder()
            .setLabel('Invite Mango')
            .setEmoji({ name: 'invite', id: '997622250587033661' })
            .setStyle(ButtonStyle.Link)
            .setURL(
              'https://discord.com/api/oauth2/authorize?client_id=950781887230664725&permissions=8&scope=bot%20applications.commands'
            )
        ) as ActionRowBuilder<ButtonBuilder>,
      ],
    });
  },
});
