// Mango Bot - multifunctional Discord application service.
// Copyright (C) 2022  YEAR Development

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

import db from '../utils/models/welcomeMessages';
import { AttachmentBuilder, TextBasedChannel } from 'discord.js';
import { Event } from '../structures/Event';
import { client } from '..';
import Canvas from 'canvas';
import { join } from 'path';

export default new Event('guildMemberAdd', async (member) => {
  const data = await db.findOne({ Guild: member.guild.id, Toggled: true });
  if (!data || !data?.Channel || !data?.Text) return;
  if (!data.Image)
    return (client.channels.cache.get(data.Channel) as TextBasedChannel)?.send({
      content: data.Text.replace(/@/g, `<@${member.id}>`),
    });

  Canvas.registerFont(join(__dirname, `../../Fonts/Panton-BlackCaps.otf`), {
    family: 'Panton',
  });
  Canvas.registerFont(join(__dirname, `../../Fonts/Montserrat-SemiBold.ttf`), {
    family: 'Montserrat',
  });

  const canvas = Canvas.createCanvas(1772, 633);
  const ctx = canvas.getContext('2d');

  const background = await Canvas.loadImage(
    join(__dirname, `../../Images/welcome.png`)
  );
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  const avatar = await Canvas.loadImage(
    member.user.displayAvatarURL({ extension: 'jpg' })
  );

  let fontsize: number = 85;
  do {
    fontsize--;
    ctx.font = `${fontsize}px Montserrat`;
  } while (ctx.measureText(member.user.tag).width > 550);

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(member.user.tag, 339, 570);

  ctx.font = '195px Panton';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 4;
  ctx.textAlign = 'center';
  ctx.fillText('WELCOME!', 1150, 340);

  ctx.font = `${-2 * member.guild.memberCount.toString().length + 74}px Panton`;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 4;
  ctx.textAlign = 'center';
  ctx.fillText(`You are member number ${member.guild.memberCount}!`, 1150, 420);

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
});
