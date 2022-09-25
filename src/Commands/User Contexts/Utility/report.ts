import { UserContext } from '../../../structures/UserContext';
import {
  EmbedBuilder,
  ApplicationCommandType,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  TextBasedChannel,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import report from '../../../utils/models/report';

export default new UserContext({
  name: 'Report User',
  type: ApplicationCommandType.User,
  timeout: 5000,
  run: async ({ interaction, client }) => {
    const target = interaction.targetUser;
    const reportSystem = await report.findOne({
      Guild: interaction.guildId,
      Toggled: true,
    });
    if (!reportSystem) return;
    if (
      !reportSystem.Channel ||
      !interaction.guild.channels.cache.get(reportSystem.Channel)
    )
      return interaction.reply({
        content:
          '⚠️ The report system is not set up properly yet. Please contact staff with this information.',
        ephemeral: true,
      });

    if (target.id === interaction.user.id)
      return interaction.reply({
        content: '⚠ You cannot report yourself.',
        ephemeral: true,
      });

    if (target.id === client.user.id)
      return interaction.reply({
        content: '⚠ You cannot report the bot.',
        ephemeral: true,
      });

    interaction.showModal(
      new ModalBuilder()
        .setTitle('User Report')
        .setCustomId('user-report')
        .addComponents([
          new ActionRowBuilder().addComponents([
            new TextInputBuilder()
              .setLabel('Reason for the report')
              .setPlaceholder(
                'Provide a sensible and detailed reason for the report'
              )
              .setCustomId('reason')
              .setMinLength(10)
              .setMaxLength(1000)
              .setRequired()
              .setStyle(TextInputStyle.Paragraph),
          ]) as ActionRowBuilder<TextInputBuilder>,
        ])
    );

    interaction
      .awaitModalSubmit({
        filter: (i) => {
          return true;
        },
        time: 300000,
      })
      .then((interaction) => {
        interaction.reply({
          content:
            '<:success:996733680422752347> Your report has been sent to the staff team. Thank you.',
          ephemeral: true,
        });
        (
          interaction.guild.channels.cache.get(
            reportSystem.Channel
          ) as TextBasedChannel
        ).send({
          embeds: [
            new EmbedBuilder()
              .setTitle('New User Report')
              .setDescription(
                `**Target**: \`${target.tag}\`\n**Reported By**: \`${
                  interaction.user.tag
                }\`\n**Reason**: \`${interaction.fields.getTextInputValue(
                  'reason'
                )}\``
              )
              .setColor('#ea664b')
              .setFooter({ text: `ID: ${target.id}` })
              .setTimestamp(),
          ],
          components: [
            new ActionRowBuilder().addComponents([
              new ButtonBuilder()
                .setLabel('Mute')
                .setCustomId('report-mute')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🔇'),
              new ButtonBuilder()
                .setLabel('Ban')
                .setCustomId('report-ban')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔨'),
            ]) as ActionRowBuilder<ButtonBuilder>,
          ],
        });
      });
  },
});
