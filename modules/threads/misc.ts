import type { AnyThreadChannel, Snowflake } from "discord.js";
import Database from "../../common/database.js";
import config from "../../common/config.js";

export const threadsDatabase = new Database<{
	id: Snowflake;
	roles: string | null;
	keepOpen: boolean;
}>("threads");
await threadsDatabase.init();

export function getThreadConfig(thread: AnyThreadChannel): { roles: string[]; keepOpen: boolean } {
	const found = threadsDatabase.data.find((found) => found.id === thread.id);

	return found
		? { keepOpen: found.keepOpen, roles: found.roles?.split("|") ?? [] }
		: {
				[config.channels.mod?.id || ""]: {
					roles: config.roles.staff ? [config.roles.staff.id] : [],
					keepOpen: false,
				},
				[config.channels.modlogs?.id || ""]: {
					roles: config.roles.mod ? [config.roles.mod.id] : [],
					keepOpen: true,
				},
				[config.channels.exec?.id || ""]: {
					roles: config.roles.exec ? [config.roles.exec.id] : [],
					keepOpen: false,
				},
				[config.channels.admin?.id || ""]: {
					roles: config.roles.staff ? [config.roles.staff.id] : [],
					keepOpen: false,
				},
		  }[thread.parent?.id || ""] ?? { roles: [], keepOpen: false };
}
