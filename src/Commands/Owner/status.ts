import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { connection } from 'mongoose';
import { Command } from '../../structures/Command';
import DB from '../../utils/models/clientStatus';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

export default new Command({
  name: 'status',
  description: 'Displays bot statistics',
  timeout: 7500,
  ownerOnly: true,
  run: async ({ interaction, client }) => {
    const docs = await DB.findOne({
      Client: true,
    });

    if (!docs || docs.Memory.length < 12) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🛑 No Data Found')
            .setDescription('Please wait for the information to be collected.'),
        ],
        ephemeral: true,
      });
    }

    const mem0 = docs.Memory[0];
    const mem1 = docs.Memory[1];
    const mem2 = docs.Memory[2];
    const mem3 = docs.Memory[3];
    const mem4 = docs.Memory[4];
    const mem5 = docs.Memory[5];
    const mem6 = docs.Memory[6];
    const mem7 = docs.Memory[7];
    const mem8 = docs.Memory[8];
    const mem9 = docs.Memory[9];
    const mem10 = docs.Memory[10];
    const mem11 = docs.Memory[11];
    const mem12 = docs.Memory[12];

    const avgMem =
      (mem0 +
        mem1 +
        mem2 +
        mem3 +
        mem4 +
        mem5 +
        mem6 +
        mem7 +
        mem8 +
        mem9 +
        mem10 +
        mem11 +
        mem12) /
      13;

    // Graph Data
    const colors = {
      purple: {
        default: 'rgba(149, 76, 233, 1)',
        half: 'rgba(149, 76, 233, 0.5)',
        quarter: 'rgba(149, 76, 233, 0.25)',
        low: 'rgba(149, 76, 233, 0.1)',
        zero: 'rgba(149, 76, 233, 0)',
      },
      indigo: {
        default: 'rgba(80, 102, 120, 1)',
        quarter: 'rgba(80, 102, 120, 0.25)',
      },
      green: {
        default: 'rgba(92, 221, 139, 1)',
        half: 'rgba(92, 221, 139, 0.5)',
        quarter: 'rgba(92, 221, 139, 0.25)',
        low: 'rgba(92, 221, 139, 0.1)',
        zero: 'rgba(92, 221, 139, 0)',
      },
    };

    const memData = [
      mem0,
      mem1,
      mem2,
      mem3,
      mem4,
      mem5,
      mem6,
      mem7,
      mem8,
      mem9,
      mem10,
      mem11,
      mem12,
    ];

    // Change it according to the setInterval() in the ready event
    const labels = [
      '60',
      '55',
      '50',
      '45',
      '40',
      '35',
      '30',
      '25',
      '20',
      '15',
      '10',
      '5',
    ];

    const width = 1500;
    const height = 720;

    const plugin = {
      id: 'mainBg',
      beforeDraw: (chart) => {
        const ctx = chart.canvas.getContext('2d');
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = '#192027';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
      },
    };

    // Canvas Generation
    const chartCallback = (ChartJS) => {};
    const canvas = new ChartJSNodeCanvas({
      width: width,
      height: height,
      plugins: {},
      chartCallback: chartCallback,
    });

    // Chart Data
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'RAM Usage',
          fill: true,
          backgroundColor: colors.green.low,
          pointBackgroundColor: colors.green.default,
          borderColor: colors.green.default,
          data: memData,
          lineTension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
        },
      ],
    };

    const chartConfig = {
      type: 'line',
      data: chartData,
      options: {
        layout: {
          padding: 10,
        },
        responsive: false,
        plugins: {
          legend: {
            display: true,
          },
        },
        scales: {
          xAxes: {
            gridLines: {
              display: false,
            },
            ticks: {
              padding: 10,
              autoSkip: false,
              maxRotation: 0,
              minRotation: 0,
            },
          },
          yAxes: {
            scaleLabel: {
              display: true,
              labelString: 'Usage',
              padding: 10,
            },
            gridLines: {
              display: true,
              color: colors.indigo.quarter,
            },
            ticks: {
              beginAtZero: false,
              max: 63,
              min: 57,
              padding: 10,
            },
          },
        },
      },
      plugins: [plugin],
    };

    const image = await canvas.renderToBuffer(chartConfig as any);
    const attachment = new AttachmentBuilder(image, {
      name: 'chart.png',
    });

    const response = new EmbedBuilder()
      .setTitle(`Client Status`)
      .setColor('#009A44')
      .addFields([
        {
          name: `<:icon_reply:962547429914337300> GENERAL`,
          value: `
                **\`•\` Client**: <:icon_online:970322600930721802> ONLINE
                **\`•\` Ping**: ${client.ws.ping} ms
                **\`•\` Up Since**: <t:${Math.floor(
                  client.readyTimestamp / 1000
                )}> (<t:${Math.floor(client.readyTimestamp / 1000)}:R>)
                `,
          inline: false,
        },
        {
          name: `<:icon_reply:962547429914337300> DATABASE`,
          value: `
                **\`•\` Connection**: ${switchTo({
                  val: connection.readyState,
                })}
                `,
          inline: true,
        },
        {
          name: `<:icon_reply:962547429914337300> HARDWARE`,
          value: `
                **\`•\` Average RAM Usage**: ${avgMem.toFixed(2)}MB
                `,
          inline: false,
        },
      ])
      .setImage('attachment://chart.png');

    interaction.reply({
      embeds: [response],
      files: [attachment],
    });
  },
});

function switchTo({ val }: { val: number }) {
  var status: string;
  switch (val) {
    case 0:
      status = `<:icon_offline:970322600771354634> DISCONNECTED`;
      break;

    case 1:
      status = `<:icon_online:970322600930721802> CONNECTED`;
      break;

    case 2:
      status = `<:icon_connecting:970322601887023125> CONNECTING`;
      break;

    case 3:
      status = `<:icon_disconnecting:970322601878638712> DISCONNECTING`;
      break;
  }
  return status;
}
