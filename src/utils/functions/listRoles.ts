import { GuildMember } from 'discord.js';

export function listRoles(member: GuildMember): string {
  const roles = member.roles.cache
    .sort((a, b) => b.position - a.position)
    .map((role) => role.toString())
    .slice(0, -1);
  let displayRoles: string;

  if (roles.length < 20) {
    displayRoles = roles.join(', ');
    if (roles.length < 1) displayRoles = 'None';
  } else {
    displayRoles = roles.slice(20).join(', ');
  }
  return displayRoles;
}
