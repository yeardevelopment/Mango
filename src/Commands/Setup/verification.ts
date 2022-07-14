import { Command } from '../../structures/Command';
import {
  GuildMember,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  TextBasedChannel,
} from 'discord.js';
import db from '../../utils/models/verification';
import { MongooseError } from 'mongoose';

export default new Command({
  name: 'verification',
  description: 'Verification system management',
  options: [
    {
      name: 'panel',
      description:
        'Sends verification panel that can be used by people to verify themselves',
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
      name: 'age',
      description:
        'The minimum age of an account for it to be eligible for verification',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'days',
          description:
            'The minimum age required in days; 0 disables the age requirement',
          type: 'INTEGER',
          required: true,
        },
      ],
    },
    {
      name: 'role',
      description:
        'Role that will be given to members after they passed the verification',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'role',
          description:
            'Role that will be given to members after they passed the verification',
          type: 'ROLE',
          required: true,
        },
      ],
    },
    {
      name: 'toggle',
      description: 'Enables/disables the verification system in this server',
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
              '⚠️ You need to enable the verification system with `/verification toggle`.',
            ephemeral: true,
          });

        const channel = args.getChannel('channel');
        const title = args.getString('title') || 'Verification System';
        const description =
          args.getString('description') ||
          'Verify yourself in order to gain full access to the server.\nStart the verification process by clicking the button below.';

        (channel as TextBasedChannel).send({
          embeds: [
            new MessageEmbed()
              .setTitle(title)
              .setDescription(description)
              .setFooter({
                text: 'You will need to have your direct messages enabled.',
              })
              .setColor('#2F3136'),
          ],
          components: [
            new MessageActionRow().setComponents(
              new MessageButton()
                .setLabel('Verify')
                .setEmoji('996733683593662485')
                .setStyle('PRIMARY')
                .setCustomId('verify')
            ),
          ],
        });
        interaction.reply({
          content: `Sent the verification panel to ${channel}.`,
        });
        break;
      }
      case 'age': {
        const age = args.getInteger('days');
        const days = age * 24 * 60 * 60 * 1000;

        const data = await db.findOne({ Guild: interaction.guild.id });
        if (data) {
          await db.findOneAndUpdate({
            Guild: interaction.guild.id,
            Age: days,
          });
        } else {
          await db.create({ Guild: interaction.guild.id, Age: days });
        }
        interaction.reply({
          content:
            '<:success:996733680422752347> Successfully updated the verification system settings in this server.',
        });
        break;
      }
      case 'role': {
        const role = args.getRole('role');

        const data = await db.findOne({ Guild: interaction.guild.id });
        if (data) {
          await db.findOneAndUpdate({
            Guild: interaction.guild.id,
            Role: role.id,
          });
        } else {
          await db.create({ Guild: interaction.guild.id, Role: role.id });
        }
        interaction.reply({
          content: `<:success:996733680422752347> Successfully updated the verification system settings in this server.`,
        });
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
              '<:success:996733680422752347> Successfully disabled the verification system in this server.',
          });
        } else if (data && data.Toggled === false) {
          await db.findOneAndUpdate(
            { Guild: interaction.guild.id },
            { Toggled: true }
          );
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled the verification system in this server.',
          });
        } else {
          await db.create({
            Guild: interaction.guild.id,
            Toggled: true,
          });
          interaction.reply({
            content:
              '<:success:996733680422752347> Successfully enabled the verification system in this server.',
          });
        }
        break;
      }
    }
  },
});
