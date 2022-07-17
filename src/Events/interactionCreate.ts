import Discord, {
  ButtonInteraction,
  Collection,
  CommandInteractionOptionResolver,
  GuildMemberRoleManager,
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageButton,
  MessageEmbed,
  TextBasedChannel,
} from 'discord.js';
import ms from 'ms';
import chalk from 'chalk';
const Timeout = new Collection();
const Verifying = new Collection();
import { client } from '..';
import { Event } from '../structures/Event';
import { ExtendedInteraction } from '../typings/Command';
import ticket from '../utils/models/ticket';
import tickets from '../utils/models/tickets';
import config from '../utils/models/config';
import { createTranscript } from 'discord-html-transcripts';
import { Captcha } from 'captcha-canvas';
import verification from '../utils/models/verification';
import moment from 'moment';

export default new Event('interactionCreate', async (interaction) => {
  if (!interaction.guild) return; // Interactions can only be called used within a guild

  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command)
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `Unable to execute the command`,
              iconURL: `https://i.imgur.com/n3QHYJM.png`,
            })
            .setDescription(
              `An error occurred while trying to execute the command`
            )
            .setColor('RED'),
        ],
        ephemeral: true,
      });

    if (command.timeout) {
      if (Timeout.has(`${command.name}${interaction.user.id}`))
        return await interaction.reply({
          content: `**:stop_sign: Chill there!**\nYou are on a \`${ms(
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
      Guild: interaction.guild.id,
      Toggled: true,
    });
    const verificationEnabled = await verification.findOne({
      Guild: interaction.guild.id,
      Toggled: true,
    });
    if (ticketSystem) {
      const data = await config.findOne({
        Guild: interaction.guild.id,
      });
      async function ticket(category: string) {
        if (!data.StaffRole)
          return (interaction as ButtonInteraction).reply({
            content:
              '⚠️ The ticket system is not set up properly yet. Please try again contact staff with this information.',
            ephemeral: true,
          });
        const parentChannel = ticketSystem.Category;
        const ticketChannel = await tickets.findOne({
          Guild: interaction.guild.id,
          Member: interaction.user.id,
        });
        if (ticketChannel)
          return (interaction as ButtonInteraction).reply({
            content: `You already have a ticket open: <#${ticketChannel.ID}>.`,
            ephemeral: true,
          });
        await (interaction as ButtonInteraction).reply({
          content: `Your ticket is being processed. Please wait.`,
          ephemeral: true,
        });
        let channel = null;
        try {
          channel = await interaction.guild.channels.create(
            `ticket-${interaction.user.username}`
          );
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
              id: interaction.guild.id,
              deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
            },
            {
              id: interaction.user.id,
              allow: [
                'SEND_MESSAGES',
                'VIEW_CHANNEL',
                'ATTACH_FILES',
                'READ_MESSAGE_HISTORY',
                'ADD_REACTIONS',
              ],
            },
            {
              id: client.user.id,
              allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
            },
            {
              id: data.StaffRole || null,
              allow: [
                'SEND_MESSAGES',
                'VIEW_CHANNEL',
                'ATTACH_FILES',
                'READ_MESSAGE_HISTORY',
                'ADD_REACTIONS',
              ],
            },
          ]);
        } catch (error) {
          console.log(error);
          return (interaction as ButtonInteraction).editReply({
            content:
              '**⚠️ Failed to create a ticket.** Please try again later!',
          });
        }
        await (interaction as ButtonInteraction).editReply({
          content: `We will be right with you! ${channel}`,
        });
        const embedticket = new MessageEmbed()
          .setTitle(`Welcome to your ticket!`)
          .addField('Ticket Category', `${category}`)
          .addField(
            `Note`,
            `Please be patient, support will be with you shortly.`
          )
          .setColor('#ea664b');
        let bu1tton = new MessageButton()
          .setStyle('DANGER')
          .setEmoji(`💾`)
          .setLabel(`Save & Close`)
          .setCustomId('close');
        let lock = new MessageButton()
          .setStyle('PRIMARY')
          .setEmoji(`🔒`)
          .setLabel(`Lock/Unlock`)
          .setCustomId('lock');
        let claim = new MessageButton()
          .setStyle('SUCCESS')
          .setEmoji(`🖐️`)
          .setLabel(`Claim`)
          .setCustomId('claim');
        let row = new MessageActionRow().addComponents([
          bu1tton,
          // lock,
          // claim,
        ]);
        channel.send({
          content: `<@${interaction.user.id}>`,
          embeds: [embedticket],
          components: [row],
        });
      }

      if (interaction.customId === 'ticket') ticket('✉️ General Support');
      if (interaction.customId === 'close') {
        if (
          !(interaction.member.roles as GuildMemberRoleManager).cache.has(
            data.StaffRole
          )
        )
          return interaction.reply({
            content: '⚠ Only staff can close the ticket.',
            ephemeral: true,
          });
        await tickets
          .findOne({ ID: interaction.channel.id }, async (err, docs) => {
            if (docs.Closed === true) {
              return interaction.reply({
                content: `This ticket is already being closed.`,
                ephemeral: true,
              });
            }
            let row = new MessageActionRow().addComponents([
              new MessageButton()
                .setStyle(`SUCCESS`)
                .setEmoji(`996733680422752347`)
                .setLabel(`Proceed`)
                .setCustomId('sure'),
            ]);
            interaction.reply({
              components: [row],
              embeds: [
                new MessageEmbed()
                  .setTitle('⚠ Are you sure?')
                  .setDescription(
                    'Are you sure you want to close this ticket?\nThis action cannot be undone.'
                  )
                  .setFooter({
                    text: `${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                  })
                  .setColor('RED'),
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
            data.StaffRole
          )
        )
          return interaction.reply({
            content: '⚠ Only staff can close the ticket.',
            ephemeral: true,
          });
        await tickets
          .findOne({ ID: interaction.channel.id }, async (err, docs) => {
            if (docs.Closed === true) {
              return interaction.reply({
                content: `This ticket is already being closed.`,
                ephemeral: true,
              });
            }
            interaction.deferUpdate();
            await tickets.updateOne(
              { ID: interaction.channel.id },
              { Closed: true }
            );
            const seconds = 5;
            const startingCounter = 20;
            let counter = startingCounter;
            const getText = () => {
              return `Closing the ticket in ${counter} seconds...`;
            };
            const updateCounter = async (msg) => {
              msg.edit(getText());
              counter -= seconds;
              if (counter <= 0) {
                return;
              }
              setTimeout(() => {
                updateCounter(msg);
              }, 1000 * seconds);
            };
            const msg = await interaction.channel?.send(getText());
            updateCounter(msg);
            let member = client.users.cache.get(docs.Members[0]);

            const embed = new MessageEmbed()
              .setTitle('Ticket Closed')
              .setDescription(
                `**Ticket Name**: \`${interaction.channel.name}\` (${
                  interaction.channel.id
                })\n**Ticket Category**: ${docs.Category}\n**Opened By**: \`${
                  member.tag
                }\` (${member.id})\n**Closed By**: \`${
                  interaction.user.tag
                }\` (${interaction.user.id})\n**Open Time**: <t:${Math.floor(
                  interaction.channel.createdTimestamp / 1000
                )}>`
              )
              .setTimestamp();
            const attachment = await createTranscript(interaction.channel, {
              limit: -1,
              returnBuffer: false,
              fileName: `transcript-${interaction.channel.name}.html`,
            });
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
            .then(async (ch) => {
              tickets
                .findOne({ ID: ch.id }, async (err, data) => {
                  if (err) throw err;
                  if (data) {
                    await tickets.findOneAndDelete({ ID: ch.id });
                  }
                })
                .clone();
            });
        }, 20000);
      }
    }
    if (verificationEnabled) {
      if (interaction.customId === 'verify') {
        const data = await verification.findOne({
          Guild: interaction.guild.id,
        });

        if (
          (interaction.member.roles as GuildMemberRoleManager).cache.has(
            data.Role
          )
        )
          return interaction.reply({
            content:
              '<:success:996733680422752347> **You are already verified.**',
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

        if (Verifying.has(`${interaction.guild.id}-${interaction.user.id}`))
          return interaction.reply({
            content: `<:cancel:996733678279462932> You already have a verification session running in [your DMs](https://discord.com/channels/@me/${client.user.id}).`,
            ephemeral: true,
          });

        interaction.deferUpdate();

        const captcha = new Captcha();
        captcha.async = true;
        captcha.addDecoy();
        captcha.drawTrace();
        captcha.drawCaptcha();

        let attachment = new MessageAttachment(
          await captcha.png,
          'captcha.png'
        );

        const msg = await interaction.user
          .send({
            embeds: [
              new MessageEmbed()
                .setTitle(
                  `<:captcha:997250229948657745> Hello! Are you human? Let's find out!`
                )
                .setDescription(
                  `Please type the captcha above to be able to access this server.\n\n**Additional Notes**:\n<:right:997250588158984393> Type out the traced colored characters from left to right.\n<:decoy:997251026962874388> Ignore the decoy characters spread-around.\n<:lowercase:997251325471502417> You have to consider characters cases (upper/lower case).`
                )
                .setColor('PURPLE')
                .setImage('attachment://captcha.png')
                .setFooter({ text: 'Verification Period: 2 minutes' }),
            ],
            files: [attachment],
          })
          .catch((error) => {
            interaction.followUp({
              content: `${interaction.user}`,
              embeds: [
                new MessageEmbed()
                  .setTitle("I couldn't send direct message to you!")
                  .setDescription(
                    '⚠ You have DMs turned off. Please turn them on using the instruction below.'
                  )
                  .setImage(
                    'https://i.postimg.cc/0jG6XQVV/how-to-enable-dms.png'
                  )
                  .setColor('YELLOW'),
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
            `${interaction.guild.id}-${interaction.user.id}`,
            Date.now() + 120000
          );
          setTimeout(() => {
            Verifying.delete(`${interaction.guild.id}-${interaction.user.id}`);
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
            let successEmbed = new MessageEmbed()
              .setTitle(`Verification Success`)
              .setColor('GREEN')
              .setDescription(`Thank you for verifying!`);
            (msg as Message).channel.send({
              embeds: [successEmbed],
            });
            (interaction.member.roles as GuildMemberRoleManager).add(data.Role);
          }
        } catch (err) {
          (msg as Message)?.channel.send({
            content: `Session expired. To start the verification process again, please go to ${interaction.channel}.`,
          });
        }
      }
    }
  }
});
