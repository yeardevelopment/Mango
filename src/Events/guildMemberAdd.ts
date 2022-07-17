import db from '../utils/models/welcomeMessages';
import { MessageAttachment, MessageEmbed, TextBasedChannel } from 'discord.js';
import { Event } from '../structures/Event';
import { client } from '..';
import Canvas from 'canvas';
import { join } from 'path';

export default new Event('guildMemberAdd', async (member) => {
  const data = await db.findOne({ Guild: member.guild.id, Toggled: true });
  if (!data || !data.Channel || !data.Text) return;
  if (data.Image) {
    // Register fonts
    Canvas.registerFont(join(__dirname, `../Fonts/Panton-BlackCaps.otf`), {
      family: 'Panton-BlackCaps',
    });
    Canvas.registerFont(join(__dirname, `../Fonts/coolvetica rg.otf`), {
      family: 'Coolvetica',
    });

    // Register Canvas
    const canvas = Canvas.createCanvas(1772, 633);
    const ctx = canvas.getContext('2d');

    // Get the background image and draw it
    const background = await Canvas.loadImage(
      join(__dirname, `../Images/background.png`)
    );
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Get info about the user
    const username = `${member.user.username}#${member.user.discriminator}`;
    const avatar = await Canvas.loadImage(
      member.user.displayAvatarURL({ format: 'jpg' })
    );

    // Draw the avatar
    ctx.beginPath();
    ctx.arc(322, 280, 208, 0, Math.PI * 2, true); // Position of the avatar
    ctx.closePath();
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 16;
    ctx.clip();

    ctx.drawImage(avatar, 322, 280, 500, 500);

    // Checks username length and draws text depending on it
    if (username.length >= 14) {
      ctx.font = '70 px Coolvetica';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 7;
      ctx.fillText(username, 322.42, 546.79);
    } else {
      ctx.font = '93 px Coolvetica';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 7;
      ctx.fillText(username, 322.42, 546.79);
    }

    // Draws the WELCOME! text
    ctx.font = '195.35 px Panton-BlackCaps';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 7;
    ctx.fillText('WELCOME!', 1177, 287.55);

    // Draws the Enjoy your stay! text
    ctx.font = '99.71 px Coolvetica';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 7;
    ctx.fillText('Enjoy your stay!', 1177, 398.46);

    const attachment = new MessageAttachment(
      canvas.toBuffer(),
      'welcome-image.png'
    );

    const embed = new MessageEmbed()
      .setColor('#00a7f3')
      .setDescription(data.Text.replace(/@/g, `<@${member.id}>`))
      .setImage('attachment://welcome-image.png');

    (client.channels.cache.get(data.Channel) as TextBasedChannel)?.send({
      embeds: [embed],
      files: [attachment],
    });
  } else {
    (client.channels.cache.get(data.Channel) as TextBasedChannel)?.send({
      content: data.Text.replace(/@/g, `<@${member.id}>`),
    });
  }
});
