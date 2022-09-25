import { Command } from '../../../structures/Command';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default new Command({
  name: 'donate',
  description: 'Support Mango by subscribing to Mango Premium',
  timeout: 5000,
  run: async ({ interaction }) => {
    interaction.reply({
      content:
        'We would be very thankful to you if you subscribed to Mango Premium. You can ask for instructions in our support server linked down below.',
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
