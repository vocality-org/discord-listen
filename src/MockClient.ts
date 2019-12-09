import { Message, MessageReaction } from 'discord.js';
import { Client, ClientOptions } from './Client';

export class MockClient extends Client {
    /**
     * Returns a discord.js message object with the given content.
     *
     * @param {string} content
     * @memberof MockClient
     */
    async message(content: string): Promise<Message | Message[] | undefined> {
        if (this.bot) {
            return this.bot.getMessageFrom(content);
        }
    }

    /**
     * Returns a message reaction object. Codes for emojis can be found at
     * https://www.webfx.com/tools/emoji-cheat-sheet/
     *
     * @param {Message} message
     * @param {string} emoji
     * @returns {(Promise<MessageReaction | undefined>)}
     * @memberof MockClient
     */
    async reaction(
        message: Message,
        emoji: string
    ): Promise<MessageReaction | undefined> {
        if (this.bot) {
            return await message.react(emoji);
        }
    }
}

export interface MockClientOptions extends ClientOptions {}
