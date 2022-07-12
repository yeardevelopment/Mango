import {
  CommandInteraction,
  Interaction,
  Message,
  PartialMessage,
} from 'discord.js';

export function getLink(value: Message | PartialMessage | CommandInteraction): string {
  return `https://discord.com/channels/${value.guild.id}/${value.channel.id}/${value.id}`;
}
