import db from '../utils/models/welcomeMessages';
import { AttachmentBuilder, EmbedBuilder, TextBasedChannel } from 'discord.js';
import { Event } from '../structures/Event';
import { client } from '..';
import Canvas from 'canvas';
import { join } from 'path';

export default new Event('guildMemberAdd', async (member) => {
  const data = await db.findOne({ Guild: member.guild.id, Toggled: true });
  if (!data || !data?.Channel || !data?.Text) return;
  if (data.Image) {
    Canvas.registerFont(join(__dirname, `../../Fonts/Panton-BlackCaps.otf`), {
      family: 'Panton',
    });
    Canvas.registerFont(
      join(__dirname, `../../Fonts/Montserrat-SemiBold.ttf`),
      {
        family: 'Montserrat',
      }
    );

    const canvas = Canvas.createCanvas(1772, 633);
    const ctx = canvas.getContext('2d');

    const background = await Canvas.loadImage(
      join(__dirname, `../../Images/image.png`)
    );
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const avatar = await Canvas.loadImage(
      member.user.displayAvatarURL({ extension: 'jpg' })
    );
    let fontSizeFormula: number;
    if (member.user.tag.length >= 14) {
      fontSizeFormula = -4 * member.user.tag.length + 135;
      ctx.font = `${fontSizeFormula}px Montserrat`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(member.user.tag, 339, 570);
    } else {
      fontSizeFormula = -7 * member.user.tag.length + 149;
      ctx.font = `${fontSizeFormula}px Montserrat`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(member.user.tag, 339, 570);
    }

    ctx.font = '195px Panton';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.textAlign = 'center';
    ctx.fillText('WELCOME!', 1150, 340);

    ctx.font = `${
      -2 * member.guild.memberCount.toString().length + 74
    }px Panton`;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.textAlign = 'center';
    ctx.fillText(
      `You are member number ${member.guild.memberCount}!`,
      1150,
      420
    );

    // Draw the avatar
    ctx.beginPath();
    ctx.arc(339, 280, 208, 0, Math.PI * 2, true); // Position of the avatar
    ctx.closePath();
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 8;
    ctx.clip();

    ctx.drawImage(avatar, 130, 71, 417, 417);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: 'welcome.png',
    });

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
