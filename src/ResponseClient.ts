import { ResponseClientOptions } from './ResponseClient';
import { Message } from 'discord.js';
import TestBot from './test-bot';

export class ResponseClient {
    private testBot: TestBot | undefined;
    private options: ResponseClientOptions;

    constructor(options?: ResponseClientOptions) {
        if (!options) {
            this.options = {
                responseTimeout: 5000,
            };
        } else {
            if (!options.responseTimeout) {
                options.responseTimeout = 5000;
            }
            this.options = options;
        }
    }

    /**
     * Initialize the test bot and response client. Make sure to added the test bot to the guild.
     *
     * @param {string} token
     * @param {string} guildId
     * @returns {Promise<ResponseClient>}
     * @memberof ResponseClient
     */
    async setup(token: string, guildId: string): Promise<ResponseClient> {
        this.testBot = new TestBot(token, guildId);

        const readyWait = new Promise(resolve => {
            this.testBot!.on('ready', async () => {
                if (this.options.channelId) {
                    this.testBot!.setChannel(this.options.channelId);
                } else {
                    await this.testBot!.createTemporaryChannel(this.options.testChannelName);
                }

                if (this.options.specificUserId) {
                    this.testBot!.responsesFrom = this.options.specificUserId;
                }
                resolve();
            });
        });

        this.testBot.init();
        await readyWait;

        return this;
    }

    /**
     * Delete the temporary channel if created and destroy the bot
     *
     * @memberof ResponseClient
     */
    async cleanup() {
        if (this.testBot) {
            if (!this.options.channelId) {
                await this.testBot.deleteTemporaryChannel();
            }
            this.testBot.destroy();
        }
    }

    /**
     * Sends a new discord message and calls the given callback function with the response.
     *
     * @param {string} content
     * @param {(response: Message) => void} callback
     * @memberof ResponseClient
     */
    write(content: string, callback: (response: Message) => void) {
        if (this.testBot) {
            this.testBot
                .getResponseTo(`${this.options.messagePrefix}${content}`, this.options.responseTimeout!)
                .then((msg: Message) => {
                    callback(msg);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}

/**
 * Options for the  {@link ResponseClient}.
 *
 * @export
 * @interface ResponseClientOptions
 */
export interface ResponseClientOptions {
    /**
     * If set and a valid discord channelId, the tests will be performed on
     * this channel. Otherwise a tempory channel will be created.
     *
     * @type {string}
     * @memberof ResponseClientOptions
     */
    channelId?: string;

    /**
     * Changes the name of the temporary testing channel.
     *
     * @type {string}
     * @memberof ResponseClientOptions
     * @default 'Running tests | created: Mon, 01 Jan 2019 00:00:00 GMT'
     */
    testChannelName?: string;

    /**
     * Sets a timeout on how long to wait for responses. Can only be between 100 and 10000 __milliseconds__.
     *
     * `100 <= timeout <= 10000`
     *
     * @type {number}
     * @memberof ResponseClientOptions
     * @default 5000
     */
    responseTimeout?: number;

    /**
     * Sets a string that will be prefixed to each message
     *
     * @type {string}
     * @memberof ResponseClientOptions
     */
    messagePrefix?: string;

    /**
     * If set, only use the responses from this userId. Others are filtered out.
     * If this field is not set, the first response will be returned.
     *
     * @type {string}
     * @memberof ResponseClientOptions
     */
    specificUserId?: string;
}
