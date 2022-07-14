import { Command } from '../../structures/Command';
import {
  GuildMember,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  TextBasedChannel,
} from 'discord.js';
import db from '../../utils/models/ticket';
import { MongooseError } from 'mongoose';

export default new Command({
  name: 'ticket',
  description: 'Ticket system management',
  options: [
    {
      name: 'panel',
      description: 'Sends ticket panel that can be used to create tickets',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'channel',
          description: 'Channel the panel to be sent to',
          type: 'CHANNEL',
          channelTypes: ['GUILD_TEXT'],
          required: true,
        },
        {
          name: 'title',
          description: 'Optional title for the panel embed',
          type: 'STRING',
          required: false,
        },
        {
          name: 'description',
          description: 'Optional description for the panel embed',
          type: 'STRING',
          required: false,
        },
      ],
    },
    {
      name: 'toggle',
      description: 'Enables/disables the ticket system in this server',
      type: 'SUB_COMMAND',
    },
  ],
  timeout: 10000,
  run: async ({ interaction, args }) => {
    switch (args.getSubcommand()) {
      case 'panel': {
        const data = await db.findOne({
          Guild: interaction.guild.id,
          Toggled: true,
        });
        if (!data || !data.Toggled)
          return interaction.reply({
            content:
              '⚠️ You need to enable the ticket system with `/ticket enable`.',
            ephemeral: true,
          });

        const channel = args.getChannel('channel');
        const description =
          args.getString('description') ||
          'Create a ticket by clicking the button below.';
        const title = args.getString('title') || 'Create a Ticket';

        (channel as TextBasedChannel).send({
          embeds: [
            new MessageEmbed()
              .setTitle(title)
              .setDescription(description)
              .setColor('#2F3136'),
          ],
          components: [
            new MessageActionRow().setComponents(
              new MessageButton()
                .setLabel('Create')
                .setEmoji('997205867646685284')
                .setStyle('PRIMARY')
                .setCustomId('ticket')
            ),
          ],
        });
        interaction.reply({ content: `Sent the ticket panel to ${channel}.` });
        break;
      }
      case 'toggle': {
        const data = await db.findOne({ Guild: interaction.guild.id });
        if (data && data.Toggled) {
          await db.findOneAndUpdate(
            { Guild: interaction.guild.id },
            { Toggled: false }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully disabled the ticket system in this server.',
          });
        } else if (data && data.Toggled === false) {
          await db.findOneAndUpdate(
            { Guild: interaction.guild.id },
            { Toggled: true }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled the ticket system in this server.',
          });
        } else {
          await db.create({
            Guild: interaction.guild.id,
            Toggled: true,
          });
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled the ticket system in this server.',
          });
        }
        break;
      }
    }
  },
});
