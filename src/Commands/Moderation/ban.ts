import { Command } from '../../structures/Command';
import Discord, {
  ButtonStyle,
  Message,
  EmbedFooterData,
  ButtonBuilder,
  ActionRowBuilder,
  ApplicationCommandOptionType,
  EmbedBuilder,
} from 'discord.js';
import { modlogs } from '../../utils/functions/modLogs';

export default new Command({
  name: 'ban',
  description:
    'Suspends a member of this server from joining back on the specified account',
  options: [
    {
      name: 'member',
      type: ApplicationCommandOptionType.User,
      description: 'Member to be suspended from joining back',
      required: true,
    },
    {
      name: 'messages',
      type: ApplicationCommandOptionType.Integer,
      description: "Whether to delete member's messages or not",
      required: true,
      choices: [
        { name: 'Do not delete any messages.', value: 0 },
        { name: 'Delete messages sent in previous 24 hours.', value: 1 },
        { name: 'Delete messages sent in previous 7 days.', value: 7 },
      ],
    },
    {
      name: 'reason',
      type: ApplicationCommandOptionType.String,
      description: 'Reason for this action',
      required: false,
    },
  ],
  timeout: 10000,
  run: async ({ interaction, client, args }) => {
    let target = args.getUser('member');
    let amount = args.getInteger('messages');

    interaction.guild.bans.fetch().then(async (bans) => {
      let banned = bans.find((ban) => ban.user.id == target.id);
      if (banned)
        return interaction.reply({
          content: '⚠ The user is already banned.',
          ephemeral: true,
        });
    });

    const isMember = interaction.guild.members.cache.get(target.id);
    if (isMember && isMember.roles.highest >= interaction.member.roles.highest)
      return interaction.reply({
        content: '⚠ You do not have enough permissions to ban the member.',
        ephemeral: true,
      });

    if (target.id === interaction.user.id) {
      return interaction.reply({
        content: '⚠ You cannot ban yourself.',
        ephemeral: true,
      });
    }
    if (target.id === client.user.id) {
      return interaction.reply({
        content: '⚠ You cannot ban the bot.',
        ephemeral: true,
      });
    }

    let reason = args.getString('reason');

    if (!reason) reason = 'No reason provided.';

    let proceedButton = new Discord.ButtonBuilder()
      .setStyle(ButtonStyle.Success)
      .setEmoji({ name: 'success', id: '996733680422752347' })
      .setLabel(`Proceed`)
      .setCustomId('proceed');
    let cancelButton = new Discord.ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setEmoji({ name: 'cancel', id: '996733678279462932' })
      .setLabel(`Cancel`)
      .setCustomId('back');
    let row = new ActionRowBuilder().addComponents([
      proceedButton,
      cancelButton,
    ]);
    let embed = new EmbedBuilder()
      .setTitle(`⚠ Are you sure?`)
      .setColor('#ff0000')
      .setDescription(
        `Are you sure you want to ban **${target.tag}** with reason: \`${reason}\`?`
      )
      .setFooter({
        text: `This action will be automatically canceled in 10 seconds if you do not select any option.`,
      });
    const confirmation = await interaction.reply({
      content: `${interaction.user}`,
      embeds: [embed],
      fetchReply: true,
      components: [row as ActionRowBuilder<ButtonBuilder>],
    });
    const filter = (inter) => inter.user.id === interaction.user.id;
    const collector = (confirmation as Message).createMessageComponentCollector(
      {
        filter,
        time: 10000,
        max: 1,
      }
    );

    collector.on('collect', async (inter) => {
      if (inter.customId === 'proceed') {
        await inter.deferReply();
        await inter.followUp({
          content: `**🔨 ${inter.user.tag}** banned **${target.tag}**.\nReason: *${reason}*`,
        });
        await modlogs(
          {
            Member: target,
            Action: 'Ban',
            Reason: reason,
            Color: '#ff0000',
          },
          interaction
        );
        await inter.guild.bans
          .create(target.id, {
            deleteMessageDays: amount,
            reason: `Banned by ${inter.user.tag} | Reason: ${reason}`,
          })
          .catch((error) => console.error(error));
      }
      if (inter.customId === 'back') {
        inter.message.delete();
      }
    });

    collector.on('end', async () => {
      let row = new Discord.ActionRowBuilder().addComponents([
        ButtonBuilder.from(proceedButton).setDisabled(),
        ButtonBuilder.from(cancelButton).setDisabled(),
      ]);
      (confirmation as Message).edit({
        embeds: [EmbedBuilder.from(embed)],
        components: [row as ActionRowBuilder<ButtonBuilder>],
      });
    });
  },
});
