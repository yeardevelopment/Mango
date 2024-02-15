// Mango Bot - multifunctional Discord application service.
// Copyright (C) 2024  YEAR Development

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

import { Captcha } from 'captcha-canvas';
import {
  GuildMemberRoleManager,
  AttachmentBuilder,
  EmbedBuilder,
  Message,
  Collection,
  TextChannel,
} from 'discord.js';
import ms from 'ms';
import { Button } from '../../../structures/Button';
import verification from '../../../utils/models/verification';
const Verifying = new Collection();

export default new Button({
  id: 'verify',
  run: async ({ interaction }) => {
    const verificationEnabled = await verification.findOne({
      Guild: interaction.guildId,
      Toggled: true,
    });
    if (!verificationEnabled) return;
    const data = await verification.findOne({
      Guild: interaction.guildId,
    });

    if (
      (interaction.member.roles as GuildMemberRoleManager).cache.has(data.Role)
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
        content:
          '<:cancel:996733678279462932> You already have a verification session running in your DMs.',
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
      .catch(() => {
        interaction.followUp({
          content: `${interaction.user}`,
          embeds: [
            new EmbedBuilder()
              .setTitle('Could Not Send Direct Message to You')
              .setDescription(
                '⚠ You have DMs turned off. Please turn them on using the instruction below.'
              )
              .setImage('https://i.postimg.cc/T3wNzCtp/How-to-turn-on-DMs.png')
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
      let res = await ((msg as Message).channel as TextChannel).awaitMessages({
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
        ((msg as Message).channel as TextChannel).send({
          embeds: [successEmbed],
        });
        (interaction.member.roles as GuildMemberRoleManager).add(data.Role);
      }
    } catch (error) {
      ((msg as Message).channel as TextChannel).send({
        content: `<:expired:1011590508436525116> Session expired. To start the verification process again, please go back to ${interaction.channel}.`,
      });
    }
  },
});
