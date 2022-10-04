import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import { join } from 'path';
import { Command } from '../../../structures/Command';

export default new Command({
  name: 'privacy',
  description: 'Learn more about how we collect your personal information',
  timeout: 5000,
  run: async ({ interaction }) => {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('We Care About Your Privacy')
          .setDescription(
            'We respect your privacy. Your personal data is encrypted and stored safely.\nIf you want to erase your data, you can forward a request to our email: `yearlegal@gmail.com`.'
          )
          .setFooter({
            text: 'By using our Services, you agree to our Privacy Policy and Terms of Service.',
          })
          .setColor('#ea664b')
          .setImage('attachment://privacy.png'),
      ],
      files: [
        new AttachmentBuilder(
          join(__dirname, `../../../../Images/privacy.png`),
          {
            name: 'privacy.png',
          }
        ),
      ],
      components: [
        new ActionRowBuilder().addComponents([
          new ButtonBuilder()
            .setLabel('Terms & Conditions')
            .setEmoji({ name: 'terms', id: '996733685313323059' })
            .setStyle(ButtonStyle.Link)
            .setURL('https://yearcommunity.wixsite.com/main/terms'),
          new ButtonBuilder()
            .setLabel('Privacy Policy')
            .setEmoji({ name: 'privacy', id: '996733682175987723' })
            .setStyle(ButtonStyle.Link)
            .setURL('https://yearcommunity.wixsite.com/main/privacy'),
        ]) as ActionRowBuilder<ButtonBuilder>,
      ],
    });
  },
});
