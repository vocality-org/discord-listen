import TestBot from './test-bot';
import { Message } from 'discord.js';

export class MockClient {
    private testBot: TestBot | undefined;

    /**
     * Initialize the test bot and mocking client.
     *
     * @param {string} token
     * @param {string} guildId
     * @returns {Promise<MockClient>}
     * @memberof MockClient
     */
    async setup(token: string, guildId: string): Promise<MockClient> {
        this.testBot = new TestBot(token, guildId);

        const readyWait = new Promise(resolve => {
            this.testBot!.on('ready', async () => {
                await this.testBot!.createTemporaryChannel('test mocking');
                resolve();
            });
        });

        this.testBot.init();
        await readyWait;

        return this;
    }

    /**
     * Returns a discord.js message object with the given content.
     *
     * @param {string} content
     * @memberof MockClient
     */
    async message(content: string): Promise<Message | Message[] | undefined> {
        if (this.testBot) {
            return this.testBot.getMessageFrom(content);
        }
    }
}
