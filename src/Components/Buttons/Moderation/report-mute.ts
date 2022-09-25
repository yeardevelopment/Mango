import {
  ActionRowBuilder,
  GuildMember,
  GuildMemberRoleManager,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import ms from 'ms';
import { Button } from '../../../structures/Button';

export default new Button({
  id: 'report-mute',
  permissions: 'ModerateMembers',
  run: async ({ interaction, client }) => {
    const user = interaction.guild.members.cache.get(
      interaction.message.embeds[0].footer.text.match(/\b\d+\b/g)[0]
    );

    if (user === null)
      return interaction.reply({
        content: `⚠ The user is not in the guild.`,
        ephemeral: true,
      });

    if (
      interaction.guild.ownerId !== (user as GuildMember).user.id &&
      (user as GuildMember).roles.highest >=
        (interaction.member.roles as GuildMemberRoleManager).highest
    )
      return interaction.reply({
        content: '⚠ You do not have enough permissions to mute the member.',
        ephemeral: true,
      });

    if ((user as GuildMember).id === interaction.user.id)
      return interaction.reply({
        content: '⚠ You cannot mute yourself.',
        ephemeral: true,
      });

    if ((user as GuildMember).id === client.user.id)
      return interaction.reply({
        content: '⚠ You cannot mute the bot.',
        ephemeral: true,
      });

    if ((user as GuildMember).isCommunicationDisabled())
      return interaction.reply({
        content: '⚠ The member is already muted.',
        ephemeral: true,
      });

    interaction.showModal(
      new ModalBuilder()
        .setTitle('Mute')
        .setCustomId('report-mute')
        .addComponents([
          new ActionRowBuilder().addComponents([
            new TextInputBuilder()
              .setLabel('Specify duration')
              .setPlaceholder(
                'Provide the duration of the mute; e.g. 1m, 1h, 1d'
              )
              .setCustomId('duration')
              .setMaxLength(50)
              .setRequired()
              .setStyle(TextInputStyle.Short),
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
        const time = interaction.fields.getTextInputValue('duration');
        if (!ms(time))
          return interaction.reply({
            content: `⚠ Please specify a valid time.`,
            ephemeral: true,
          });
        if (ms(time) > 2419200000)
          return interaction.reply({
            content: `⚠ You cannot specify duration longer than 28 days. [Learn more ›](<https://discord.com/developers/docs/resources/guild#modify-guild-member>)`,
            ephemeral: true,
          });
        interaction.reply({
          content: `🔇 **${interaction.user.tag}** muted **${
            user.user.tag
          }** for ${ms(ms(time), { long: true })}.`,
        });
        user.timeout(
          ms(time),
          `Muted by ${interaction.user.tag} | Reason: Action held within a report`
        );
      });
  },
});
