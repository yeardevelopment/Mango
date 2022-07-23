import { Command } from '../../structures/Command';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default new Command({
  name: 'donate',
  description: 'Support Mango by subscribing to Mango Premium',
  timeout: 5000,
  run: async ({ interaction }) => {
    interaction.reply({
      content:
        'We would be very thankful to you if you subscribed to Mango Premium. Subscribe by clicking the button below.',
      components: [
        new ActionRowBuilder().setComponents(
          new ButtonBuilder()
            .setLabel('Donate')
            .setEmoji({ name: 'patreon', id: '999782274180587540' })
            .setStyle(ButtonStyle.Link)
            .setURL('https://www.patreon.com/yeardevelopment'),
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
