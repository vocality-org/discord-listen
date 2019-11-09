import { Message } from 'discord.js';
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
}

export interface MockClientOptions extends ClientOptions {}
