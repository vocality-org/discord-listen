import { Message } from 'discord.js';
import { Client, ClientOptions } from './Client';

const DEFAULT_TIMEOUT = 5000;

export class ResponseClient extends Client {
    protected options: ResponseClientOptions;

    constructor(options?: ResponseClientOptions) {
        super();

        this.options = options ? options : {};

        if (!this.options.responseTimeout) {
            this.options.responseTimeout = DEFAULT_TIMEOUT;
        }
    }

    /**
     * Sends a new discord message and calls the given callback function with the response.
     *
     * @param {string} content
     * @param {(response: Message) => void} callback
     * @memberof ResponseClient
     */
    write(content: string) {
        return new Promise<Message>((resolve, reject) => {
            if (this.bot) {
                this.bot
                    .getResponseTo(
                        `${this.options.messagePrefix}${content}`,
                        this.options.responseTimeout!,
                        this.options.specificUserId
                    )
                    .then((msg: Message) => {
                        resolve(msg);
                    })
                    .catch(err => {
                        reject(err);
                    });
            }
        });
    }
}

/**
 * Options for the  {@link ResponseClient}.
 *
 * @export
 * @interface ResponseClientOptions
 */
export interface ResponseClientOptions extends ClientOptions {
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
     * If set, only use the responses from this userId. Others are filtered out.
     * If this field is not set, the first response will be returned.
     *
     * @type {string}
     * @memberof ResponseClientOptions
     */
    specificUserId?: string;
}
