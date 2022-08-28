import Discord, {
  ButtonInteraction,
  Collection,
  CommandInteractionOptionResolver,
  GuildMemberRoleManager,
  Message,
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  EmbedBuilder,
  TextBasedChannel,
  InteractionType,
  ButtonStyle,
  PermissionsBitField,
} from 'discord.js';
import ms from 'ms';
import chalk from 'chalk';
const Timeout = new Collection();
const Verifying = new Collection();
import { client } from '..';
import { Event } from '../structures/Event';
import { ExtendedInteraction } from '../typings/Command';
import premiumGuilds from '../utils/models/premiumGuilds';
import ticket from '../utils/models/ticket';
import tickets from '../utils/models/tickets';
import { createTranscript } from 'discord-html-transcripts';
import { Captcha } from 'captcha-canvas';
import verification from '../utils/models/verification';
import { capitalizeWords } from '../utils/functions/capitalizeWords';

export default new Event('interactionCreate', async (interaction) => {
  if (!interaction.guild) return; // Interactions can only be called used within a guild

  if (interaction.type === InteractionType.ApplicationCommand) {
    const command = client.commands.get(interaction.commandName);
    if (!command)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `Unable to execute the command`,
              iconURL: `https://i.imgur.com/n3QHYJM.png`,
            })
            .setDescription(
              `An error occurred while trying to execute the command`
            )
            .setColor('#ff0000'),
        ],
        ephemeral: true,
      });

    if (command.ownerOnly) {
      if (!(await client.config).owners.includes(interaction.user.id))
        return interaction.reply({
          content: '⚠️ You cannot use this command.',
          ephemeral: true,
        });
    }

    if (command.premiumOnly) {
      const data = await premiumGuilds.findOne({ Guild: interaction.guildId });
      if (Date.now() > data.Expire) {
        data.delete();
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('This is a Mango Premium command')
              .setDescription(
                'This command only works within servers that are subscribed to Mango Premium. You can ask owners to subscribe to it.'
              )
              .setColor('#ff0000'),
          ],
        });
      }
    }

    if (command.permissions) {
      if (
        !(interaction.member.permissions as PermissionsBitField).has(
          command.permissions
        )
      )
        return interaction.reply({
          content: `**✋ Hold on!**\nYou need to have \`${capitalizeWords({
            string: (command.permissions as string)
              .replaceAll(/([A-Z])/g, ' $1')
              .toLowerCase()
              .replaceAll('guild', 'server')
              .substring(1),
          })}\` permission to use this command.`,
          ephemeral: true,
        });
    }

    if (command.timeout) {
      if (Timeout.has(`${command.name}${interaction.user.id}`))
        return await interaction.reply({
          content: `**🛑 Chill there!**\nYou are on a \`${ms(
            (Timeout.get(`${command.name}${interaction.user.id}`) as number) -
              Date.now(),
            { long: true }
          )}\` cooldown.`,
          ephemeral: true,
        });
    }

    try {
      command.run({
        args: interaction.options as CommandInteractionOptionResolver,
        client,
        interaction: interaction as ExtendedInteraction,
      });
      console.log(
        `${interaction.user.tag} (${
          interaction.user.id
        }) executed ${chalk.bold.green(command.name)}. Interaction ID: ${
          interaction.id
        }`
      );
      Timeout.set(
        `${command.name}${interaction.user.id}`,
        Date.now() + command.timeout
      );
      setTimeout(() => {
        Timeout.delete(`${command.name}${interaction.user.id}`);
      }, command.timeout);
    } catch (error) {
      console.error(error);
    }
  }
  if (interaction.isButton()) {
    const ticketSystem = await ticket.findOne({
      Guild: interaction.guildId,
      Toggled: true,
    });
    const verificationEnabled = await verification.findOne({
      Guild: interaction.guildId,
      Toggled: true,
    });
    if (ticketSystem) {
      async function ticket({ category }: { category: string }): Promise<any> {
        if (!ticketSystem.StaffRole)
          return (interaction as ButtonInteraction).reply({
            content:
              '⚠️ The ticket system is not set up properly yet. Please contact staff with this information.',
            ephemeral: true,
          });
        const parentChannel = ticketSystem.Category;
        const ticketChannel = await tickets.findOne({
          Guild: interaction.guildId,
          Member: interaction.user.id,
        });
        if (ticketChannel)
          return (interaction as ButtonInteraction).reply({
            content: `<:cancel:996733678279462932> You already have a ticket open: <#${ticketChannel.ID}>.`,
            ephemeral: true,
          });
        await (interaction as ButtonInteraction).reply({
          content: `<:loading:1011290361450221718> Your ticket is being processed. Please wait.`,
          ephemeral: true,
        });
        let channel: TextBasedChannel | null = null;
        try {
          channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            reason: 'Ticket opened',
          });
          await tickets.create({
            Category: category,
            ID: channel.id,
            Member: interaction.user.id,
            Members: [interaction.user.id],
            Closed: false,
            Claimed: false,
            Locked: false,
          });

          await channel.setParent(parentChannel);
          await channel.permissionOverwrites.set([
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
              id: ticketSystem.StaffRole || null,
              allow: [
                'SendMessages',
                'ViewChannel',
                'AttachFiles',
                'ReadMessageHistory',
                'AddReactions',
              ],
            },
          ]);
        } catch (error) {
          console.error(error);
          return (interaction as ButtonInteraction).editReply({
            content:
              '**⚠️ Failed to create a ticket.** Please try again later!',
          });
        }
        await (interaction as ButtonInteraction).editReply({
          content: `We will be right with you! ${channel}`,
        });
        const embedticket = new EmbedBuilder()
          .setTitle(`Welcome to your ticket!`)
          .addFields([{ name: 'Ticket Category', value: category }])
          .addFields([
            {
              name: `Note`,
              value: `Please be patient, support will be with you shortly.`,
            },
          ])
          .setColor('#ea664b');
        let bu1tton = new ButtonBuilder()
          .setStyle(ButtonStyle.Danger)
          .setEmoji(`💾`)
          .setLabel(`Save & Close`)
          .setCustomId('close');
        let lock = new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setEmoji(`🔒`)
          .setLabel(`Lock/Unlock`)
          .setCustomId('lock');
        let claim = new ButtonBuilder()
          .setStyle(ButtonStyle.Success)
          .setEmoji(`🖐️`)
          .setLabel(`Claim`)
          .setCustomId('claim');
        let row = new ActionRowBuilder().addComponents([bu1tton]);
        channel.send({
          content: `<@${interaction.user.id}>`,
          embeds: [embedticket],
          components: [row as ActionRowBuilder<ButtonBuilder>],
        });
      }

      if (interaction.customId === 'ticket')
        ticket({ category: '✉️ General Support' });
      if (interaction.customId === 'close') {
        if (
          !(interaction.member.roles as GuildMemberRoleManager).cache.has(
            ticketSystem.StaffRole
          )
        )
          return interaction.reply({
            content: '⚠ Only staff can close the ticket.',
            ephemeral: true,
          });
        await tickets
          .findOne({ ID: interaction.channelId }, async (err, docs) => {
            if (docs.Closed === true) {
              return interaction.reply({
                content: 'This ticket is already being closed.',
                ephemeral: true,
              });
            }
            let row = new ActionRowBuilder().addComponents([
              new ButtonBuilder()
                .setStyle(ButtonStyle.Success)
                .setEmoji({ name: 'success', id: '996733680422752347' })
                .setLabel(`Proceed`)
                .setCustomId('sure'),
            ]);
            interaction.reply({
              components: [row as ActionRowBuilder<ButtonBuilder>],
              embeds: [
                new EmbedBuilder()
                  .setTitle('⚠ Are you sure?')
                  .setDescription(
                    'Are you sure you want to close this ticket?\nThis action cannot be undone.'
                  )
                  .setColor('#ff0000'),
              ],
              ephemeral: true,
              fetchReply: true,
            });
          })
          .clone();
      }
      if (interaction.customId === 'sure') {
        if (interaction.channel.parentId !== ticketSystem.Category) return;
        if (
          !(interaction.member.roles as GuildMemberRoleManager).cache.has(
            ticketSystem.StaffRole
          )
        )
          return interaction.reply({
            content: '⚠ Only staff can close the ticket.',
            ephemeral: true,
          });
        await tickets
          .findOne({ ID: interaction.channelId }, async (err, docs) => {
            if (docs.Closed === true) {
              return interaction.reply({
                content: `This ticket is already being closed.`,
                ephemeral: true,
              });
            }
            interaction.deferUpdate();
            await tickets.updateOne(
              { ID: interaction.channelId },
              { Closed: true }
            );
            const attachment = await createTranscript(interaction.channel, {
              limit: -1,
              returnBuffer: false,
              saveImages: true,
              fileName: `transcript-${interaction.channel.name}.html`,
            });
            interaction.channel?.send({
              content: `Closing the ticket <t:${Math.floor(
                (Date.now() + 20000) / 1000
              )}:R>...`,
            });
            let member = client.users.cache.get(docs.Members[0]);

            const embed = new EmbedBuilder()
              .setTitle('Ticket Closed')
              .setDescription(
                `**Ticket Name**: \`${interaction.channel.name}\` (${
                  interaction.channelId
                })\n**Opened By**: \`${member.tag}\` (${
                  member.id
                })\n**Closed By**: \`${interaction.user.tag}\` (${
                  interaction.user.id
                })\n**Open Time**: <t:${Math.floor(
                  interaction.channel.createdTimestamp / 1000
                )}>`
              )
              .setColor('#ea664b')
              .setTimestamp(Date.now() + 20000);
            await (
              client.channels.cache.get(
                ticketSystem.LogsChannel
              ) as TextBasedChannel
            )?.send({ embeds: [embed], files: [attachment] });
          })
          .clone();
        setTimeout(() => {
          interaction.channel
            ?.delete('[Ticket System] Ticket Closed')
            .then(async (channel) => {
              const data = await tickets.findOne({ ID: channel.id });
              if (data) data.delete();
            });
        }, 20000);
      }
    }
    if (verificationEnabled) {
      if (interaction.customId === 'verify') {
        const data = await verification.findOne({
          Guild: interaction.guildId,
        });

        if (
          (interaction.member.roles as GuildMemberRoleManager).cache.has(
            data.Role
          )
        )
          return interaction.reply({
            content: '<:success:996733680422752347> You are already verified.',
            ephemeral: true,
          });

        if (Date.now() - Number(interaction.user.createdAt) < data.Age)
          return interaction.reply({
            content: `<:cancel:996733678279462932> You do not meet the minimum account age requirement for this server - ${ms(
              data.Age,
              { long: true }
            )}.`,
            ephemeral: true,
          });

        if (Verifying.has(`${interaction.guildId}-${interaction.user.id}`))
          return interaction.reply({
            content: `<:cancel:996733678279462932> You already have a verification session running in your DMs.`,
            ephemeral: true,
          });

        interaction.deferUpdate();

        const captcha = new Captcha();
        captcha.async = true;
        captcha.addDecoy();
        captcha.drawTrace();
        captcha.drawCaptcha();

        let attachment = new AttachmentBuilder(await captcha.png, {
          name: 'captcha.png',
        });

        const msg = await interaction.user
          .send({
            embeds: [
              new EmbedBuilder()
                .setTitle(
                  `<:captcha:997250229948657745> Hello! Are you human? Let's find out!`
                )
                .setDescription(
                  `Please type the captcha below to be able to access \`${interaction.guild.name}\`.\n\n**Additional Notes**:\n<:right:997250588158984393> Type out the traced colored characters from left to right.\n<:decoy:997251026962874388> Ignore the decoy characters spread-around.\n<:lowercase:997251325471502417> You have to consider characters cases (upper/lower case).`
                )
                .setColor('#6a0dad')
                .setImage('attachment://captcha.png')
                .setFooter({ text: 'Verification Period: 2 minutes' }),
            ],
            files: [attachment],
          })
          .catch((error) => {
            interaction.followUp({
              content: `${interaction.user}`,
              embeds: [
                new EmbedBuilder()
                  .setTitle('Could Not Send Direct Message to You')
                  .setDescription(
                    '⚠ You have DMs turned off. Please turn them on using the instruction below.'
                  )
                  .setImage(
                    'https://i.postimg.cc/T3wNzCtp/How-to-turn-on-DMs.png'
                  )
                  .setColor('#ffff00'),
              ],
              ephemeral: true,
            });
          });
        if (msg) {
          interaction.followUp({
            content: `Verification session started in [your DMs](<https://discord.com/channels/@me/${msg.channelId}>).`,
            ephemeral: true,
          });
          Verifying.set(
            `${interaction.guildId}-${interaction.user.id}`,
            Date.now() + 120000
          );
          setTimeout(() => {
            Verifying.delete(`${interaction.guildId}-${interaction.user.id}`);
          }, 120000);
        }
        try {
          let filter = (m) => {
            if (m.author.bot || m.author.id !== interaction.user.id) return;
            if (m.content === captcha.text) return true;
            else {
              m.channel.send({
                content:
                  '<:cancel:996733678279462932> You did not pass the verification. Please try again.',
              });
            }
          };
          let res = await (msg as Message).channel.awaitMessages({
            filter,
            max: 1,
            time: 120000,
            errors: ['time'],
          });
          if (res) {
            let successEmbed = new EmbedBuilder()
              .setTitle(`Verification Success`)
              .setColor('#009A44')
              .setDescription('You successfully passed the verification.');
            (msg as Message).channel.send({
              embeds: [successEmbed],
            });
            (interaction.member.roles as GuildMemberRoleManager).add(data.Role);
          }
        } catch (err) {
          (msg as Message)?.channel.send({
            content: `<:expired:1011590508436525116> Session expired. To start the verification process again, please go back to ${interaction.channel}.`,
          });
        }
      }
    }
  }
});
