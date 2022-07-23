import { CommandInteraction, Message, PartialMessage } from 'discord.js';

export function getLink(
  value: Message | PartialMessage | CommandInteraction
): string {
  return `https://discord.com/channels/${value.guildId}/${value.channelId}/${value.id}`;
}
