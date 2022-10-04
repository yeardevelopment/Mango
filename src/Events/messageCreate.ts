import { Event } from '../structures/Event';
import leveling from '../utils/models/leveling';
// import Levels from 'discord-xp';
import { MessageType } from 'discord.js';

export default new Event('messageCreate', async (message) => {
  if (!message.guild || message.author.bot || message.type !== MessageType.Default) return;
  const data = await leveling.findOne({
    Guild: message.guildId,
    Toggled: true,
  });
  if (!data) return;

  // let randomAmountOfXp = Math.floor(Math.random() * 24) + 1;
  // const hasLeveledUp = await Levels.appendXp(
  //   message.author.id,
  //   message.guild.id,
  //   randomAmountOfXp
  // );
  // if (hasLeveledUp) {
  //   const user = await Levels.fetch(message.author.id, message.guild.id);
  //   message.channel?.send({
  //     content: `${message.author}, congratulations! You have leveled up to **${user.level}**. :tada:`,
  //   });
  // }
});
