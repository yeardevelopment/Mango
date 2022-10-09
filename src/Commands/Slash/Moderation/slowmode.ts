import { Command } from '../../../structures/Command';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import ms from 'ms';

export default new Command({
  name: 'slowmode',
  description: 'Sets a rate limit per messages',
  options: [
    {
      name: 'off',
      type: ApplicationCommandOptionType.Subcommand,
      description:
        'Turns off slowmode in the channel allowing members to send messages freely',
      options: [
        {
          name: 'reason',
          type: ApplicationCommandOptionType.String,
          description: 'Reason for this action',
          required: false,
        },
      ],
    },
    {
      name: 'on',
      type: ApplicationCommandOptionType.Subcommand,
      description:
        'Restricts members to sending one message in the channel per an interval',
      options: [
        {
          name: 'time',
          type: ApplicationCommandOptionType.String,
          description: 'Select a slowmode time to set.',
          required: true,
        },
        {
          name: 'reason',
          type: ApplicationCommandOptionType.String,
          description: 'Reason for this action',
          required: false,
        },
      ],
    },
  ],
  permissions: 'ManageMessages',
  timeout: 5000,
  run: async ({ interaction, client, args }) => {
    switch (args.getSubcommand()) {
      case 'off': {
        let reason = args.getString('reason') || 'No reason provided.';
        if (interaction.channel.rateLimitPerUser === 0)
          return interaction.reply({
            content: `⚠ Slowmode is already turned off in this channel.`,
            ephemeral: true,
          });
        interaction.channel.setRateLimitPerUser(0);
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `Successfully turned off the slowmode in this channel.`
              )
              .setColor('#2F3136')
              .setTimestamp(),
          ],
          ephemeral: true,
        });
        break;
      }
      case 'on': {
        let time = args.getString('time');
        let reason = args.getString('reason') || 'No reason provided.';

        if (interaction.channel.rateLimitPerUser === ms(time) / 1000)
          return interaction.reply({
            content: `⚠ There is already slowmode of ${
              ms(time) / 1000
            } seconds in this channel.`,
            ephemeral: true,
          });

        interaction.channel.setRateLimitPerUser(ms(time) / 1000);
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `Successfully set the slowmode to ${ms(ms(time), {
                  long: true,
                })} in this channel.`
              )
              .setColor('#2F3136')
              .setTimestamp(),
          ],
          ephemeral: true,
        });
        break;
      }
    }
  },
});
