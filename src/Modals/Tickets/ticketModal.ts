import {
  TextBasedChannel,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalSubmitInteraction,
} from 'discord.js';
import { Modal } from '../../structures/Modal';
import errors from '../../utils/models/errors';
import ticket from '../../utils/models/ticket';
import tickets from '../../utils/models/tickets';

export default new Modal({
  id: 'ticket-modal',
  run: async ({ interaction, client }) => {
    const ticketSystem = await ticket.findOne({
      Guild: interaction.guildId,
      Toggled: true,
    });
    const parentChannel = ticketSystem.Category;
    await interaction.reply({
      content: `<:loading:1011290361450221718> Your ticket is being processed. Please wait.`,
      ephemeral: true,
    });
    let channel: TextBasedChannel | null = null;
    try {
      channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        reason: 'Ticket opened',
        parent: parentChannel,
        permissionOverwrites: [
          {
            id: interaction.guildId,
            deny: ['SendMessages', 'ViewChannel'],
          },
          {
            id: interaction.user.id,
            allow: [
              'SendMessages',
              'ViewChannel',
              'AttachFiles',
              'ReadMessageHistory',
              'AddReactions',
            ],
          },
          {
            id: client.user.id,
            allow: ['SendMessages', 'ViewChannel'],
          },
          {
            id: ticketSystem.StaffRole,
            allow: [
              'SendMessages',
              'ViewChannel',
              'AttachFiles',
              'ReadMessageHistory',
              'AddReactions',
            ],
          },
        ],
      });
      await tickets.create({
        ID: channel.id,
        Member: interaction.user.id,
        Guild: interaction.guildId,
        OpenReason: interaction.fields.getTextInputValue('reason'),
        Members: [interaction.user.id],
        Closed: false,
        Claimed: false,
        Locked: false,
      });
    } catch (error) {
      await saveError({ error, interaction });
    }
    await interaction.editReply({
      content: `We will be right with you! ${channel}`,
    });
    const embedticket = new EmbedBuilder()
      .setTitle(`Welcome to your ticket!`)
      .addFields([
        {
          name: 'Open Reason',
          value: interaction.fields.getTextInputValue('reason'),
        },
        {
          name: 'Note',
          value: 'Please be patient, support will be with you shortly.',
        },
      ])
      .setColor('#ea664b');
    let close = new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setEmoji(`💾`)
      .setLabel(`Save & Close`)
      .setCustomId('close');
    let lock = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setEmoji(`🔒`)
      .setLabel(`Lock/Unlock`)
      .setCustomId('lock');
    let claim = new ButtonBuilder() // TODO: implement claim feature
      .setStyle(ButtonStyle.Success)
      .setEmoji(`🖐️`)
      .setLabel(`Claim`)
      .setCustomId('claim');
    let row = new ActionRowBuilder().addComponents([close, lock]);
    channel.send({
      content: `<@${interaction.user.id}>`,
      embeds: [embedticket],
      components: [row as ActionRowBuilder<ButtonBuilder>],
    });
  },
});

async function saveError({
  error,
  interaction,
}: {
  error: any;
  interaction: ModalSubmitInteraction;
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
