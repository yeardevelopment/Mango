import db from '../utils/models/welcomeMessages';
import { MessageAttachment, MessageEmbed, TextBasedChannel } from 'discord.js';
import { Event } from '../structures/Event';
import { client } from '..';
import Canvas from 'canvas';

// Canvas.registerFont('fonts/Panton-BlackCaps.ttf', {
//   family: 'Panton-BlackCaps',
// });npm

export default new Event('guildMemberAdd', async (member) => {
  const data = await db.findOne({ Guild: member.guild.id, Toggled: true });
  if (!data || !data.Channel || !data.Text) return;
  if (data.Image) {
    const canvas = Canvas.createCanvas(768, 319);
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = '#74037b';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Slightly smaller text placed above the member's display name
    ctx.font = '28px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      'Welcome to the server,',
      canvas.width / 2.5,
      canvas.height / 3.5
    );

    // Add an exclamation point here and below
    ctx.font = '28px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      `${member.displayName}!`,
      canvas.width / 2.5,
      canvas.height / 1.8
    );

    ctx.beginPath();
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const avatar = await Canvas.loadImage(
      member.user.displayAvatarURL({ format: 'jpg' })
    );
    ctx.drawImage(avatar, 25, 25, 200, 200);

    const attachment = new MessageAttachment(
      canvas.toBuffer(),
      'welcome-image.png'
    );

    (client.channels.cache.get(data.Channel) as TextBasedChannel)?.send({
      content: data.Text.replace(/@/g, `<@${member.id}>`),
      files: [attachment],
    });
  } else {
    (client.channels.cache.get(data.Channel) as TextBasedChannel)?.send({
      content: data.Text.replace(/@/g, `<@${member.id}>`),
    });
  }
});
