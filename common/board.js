import { Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import getAllMessages from "../lib/getAllMessages.js";
import dotenv from "dotenv";

dotenv.config();
export const BOARD_CHANNEL = process.env.BOARD_CHANNEL;
export const BOARD_EMOJI = "🥔";
export const MIN_COUNT = 1;

/** @param {Message<boolean>} message */
export async function getMessageFromBoard(message) {
	if (!message.guild) return;
	const board = await message.guild.channels.fetch(BOARD_CHANNEL || "");
	if (!board?.isText())
		throw new Error("No board channel found. Make sure BOARD_CHANNEL is set in the .env file.");
	const fetchedMessages = await getAllMessages(board);
	return fetchedMessages.find((boardMessage) => {
		const component = boardMessage?.components[0]?.components?.[0];
		if (component?.type !== "BUTTON") return false;
		const [, , messageId] = component.url?.match(/\d+/g) || [];
		return messageId === message.id;
	});
}

/**
 * @param {Message} [repliedMessage]
 *
 * @returns {string}
 */
function generateReplyInfo(repliedMessage) {
	if (!repliedMessage) return "";
	const { author, content } = repliedMessage;
	if (content) return `*Replying to **${author.username}**:*\n> ${content}\n\n`;
	else return `*Replying to **${author.username}***\n\n`;
}

/** @param {Message<boolean>} message */
export async function postMessageToBoard(message) {
	if (!message.guild) return;

	const author = await message.guild?.members.fetch(message.author).catch(() => {});

	const board = await message.guild.channels.fetch(BOARD_CHANNEL || "");
	if (!board?.isText())
		throw new Error("No board channel found. Make sure BOARD_CHANNEL is set in the .env file.");

	const repliedMessage = message.reference?.messageId
		? await message.channel.messages.fetch(message.reference?.messageId)
		: undefined;

	const repliedInfo = generateReplyInfo(repliedMessage);

console.log(message.valueOf());

	const embed = new MessageEmbed()
		.setColor(0xffd700)
		.setDescription(repliedInfo + message.content)
		.setAuthor({
			name: author?.displayName || message.author.username,
			iconURL:
				author?.displayAvatarURL() ||
				message.author.displayAvatarURL() ||
				message.author.defaultAvatarURL ||
				"",
		})
		.setTimestamp(message.createdTimestamp);

	const embeds = [
		embed,
		...message.stickers.map((sticker) => {
			return new MessageEmbed()
				.setDescription("")
				.setImage(`https://media.discordapp.net/stickers/` + sticker.id + `.webp?size=160`);
		}),
		...message.embeds.map((oldEmbed) => new MessageEmbed(oldEmbed)),
	];

	while (embeds.length > 10) embeds.pop();

	const button = new MessageButton()
		.setEmoji("👀")
		.setLabel("View Context")
		.setStyle("LINK")
		.setURL(
			"https://discord.com/channels/" +
				message.guild.id +
				"/" +
				message.channel.id +
				"/" +
				message.id,
		);

	await board.send({
		content:
			`**${BOARD_EMOJI} ${message.reactions.resolve(BOARD_EMOJI)?.count || 0}** | ${
				message.channel
			}` + (author ? ` | ${author}` : ""),
		embeds,
		files: message.attachments.map((a) => a),
		components: [new MessageActionRow().addComponents(button)],
	});
}

/**
 * @param {number} newCount
 * @param {Message<boolean>} boardMessage
 */
export async function updateReactionCount(newCount = 0, boardMessage) {
	if (newCount < Math.max(MIN_COUNT - 1, 1)) return boardMessage.delete();
	return boardMessage.edit({
		content: boardMessage.content.replace(/ \d+\*\*/, ` ${newCount}**`),
		embeds: boardMessage.embeds.map((oldEmbed) => new MessageEmbed(oldEmbed)),
		files: boardMessage.attachments.map((a) => a),
	});
}
