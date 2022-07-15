import { Command } from '../../structures/Command';
import Discord, { MessageActionRow, MessageButton } from 'discord.js';

export default new Command({
  name: 'support',
  description: 'Join the official Mango Support Server',
  timeout: 5000,
  run: async ({ interaction }) => {
    interaction.reply({
      content:
        'Click the button below to join the Official Mango support server.',
      components: [
        new MessageActionRow().setComponents(
          new MessageButton()
            .setLabel('Support Server')
            .setEmoji('996734485120962591')
            .setStyle('LINK')
            .setURL('https://discord.gg/QeKcwprdCY'),
          new MessageButton()
            .setLabel('Invite Mango')
            .setEmoji('997622250587033661')
            .setStyle('LINK')
            .setURL(
              'https://discord.com/api/oauth2/authorize?client_id=950781887230664725&permissions=8&scope=bot%20applications.commands'
            )
        ),
      ],
    });
  },
});
