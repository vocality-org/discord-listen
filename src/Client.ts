import Bot from './Bot';

export class Client {
    protected bot: Bot | undefined;
    protected options: ClientOptions;

    constructor(options?: ClientOptions) {
        this.options = options ? options : {};
    }

    /**
     * Initialize the test bot and response client. Make sure to added the test bot to the guild.
     *
     * @param {string} token
     * @param {string} guildId
     * @memberof ResponseClient
     */
    async connect(token: string, guildId: string) {
        this.bot = new Bot(token, guildId);

        const readyWait = new Promise(resolve => {
            this.bot!.on('ready', async () => {
                if (this.options.channelId) {
                    this.bot!.setChannel(this.options.channelId);
                } else {
                    await this.bot!.createTemporaryTextChannel(this.options.tempChannelName);
                }

                resolve();
            });
        });

        this.bot.init();
        await readyWait;

        return this;
    }

    /**
     * Disconnect the bot and delete temporary channel only if created
     *
     * @memberof Client
     */
    async cleanup() {
        if (this.bot) {
            if (!this.options.channelId) {
                await this.bot.deleteTemporaryTextChannel();
            }
            this.bot.destroy();
        }
    }
}

/**
 * Options for a generic {@link Client}
 *
 * @export
 * @interface ClientOptions
 */
export interface ClientOptions {
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
    tempChannelName?: string;

    /**
     * Sets a string that will be prefixed to each message
     *
     * @type {string}
     * @memberof ResponseClientOptions
     */
    messagePrefix?: string;
}
