import { time, TimestampStyles, type ChatInputCommandInteraction } from "discord.js";
import { client } from "strife.js";
import pkg from "../../package.json" assert { type: "json" };
import constants from "../../common/constants.js";

export default async function status(interaction: ChatInputCommandInteraction): Promise<void> {
	const message = await interaction.reply({ content: "Pinging…", fetchReply: true });

	await interaction.editReply({
		content: "",

		embeds: [
			{
				title: "Status",
				thumbnail: { url: client.user.displayAvatarURL() },
				color: constants.themeColor,
				description:
					"I’m open-source! The source code is available [on GitHub](https://github.com/scratchaddons-community/scradd).",

				fields: [
					{
						name: "⚙️ Mode",
						value: process.env.NODE_ENV === "production" ? "Production" : "Development",
						inline: true,
					},
					{ name: "🔢 Version", value: `v${pkg.version}`, inline: true },
					{
						name: "🔁 Last restarted",
						value: time(client.readyAt, TimestampStyles.RelativeTime),
						inline: true,
					},
					{
						name: "🏓 Ping",
						value: `${Math.abs(
							message.createdTimestamp - interaction.createdTimestamp,
						).toLocaleString()}ms`,
						inline: true,
					},
					{
						name: "↕️ WebSocket latency",
						value: `${Math.abs(client.ws.ping).toLocaleString()}ms`,
						inline: true,
					},
					{
						name: "💾 RAM usage",
						value:
							(process.memoryUsage.rss() / 1_000_000).toLocaleString([], {
								maximumFractionDigits: 2,
								minimumFractionDigits: 2,
							}) + " MB",
						inline: true,
					},
				],
			},
		],
	});
}
