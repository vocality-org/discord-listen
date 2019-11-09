import Discord, { Guild, TextChannel, Message } from 'discord.js';

export default class Bot extends Discord.Client {
    private guild: Guild | undefined;
    private channel: TextChannel | undefined;

    constructor(token: string, guildId: string) {
        super();
        this.token = token;

        this.on('ready', () => {
            this.guild = this.guilds.get(guildId);
        });
    }

    init() {
        this.login(this.token).catch(err => {
            console.log(err);
            process.exit(1);
        });
    }

    setChannel(channelId: string) {
        const c = this.channels.get(channelId);

        if (c instanceof TextChannel) {
            this.channel = c;
        }
    }

    getMessageFrom(content: string) {
        return this.channel!.send(content);
    }

    getResponseTo(content: string, timeout: number, userId?: string): Promise<Message> {
        return new Promise(async resolve => {
            await this.channel!.send(content);
            await this.channel!.awaitMessages(userId ? this.fromUser(userId) : this.noFilter, {
                max: 1,
                time: timeout,
                errors: ['time'],
            })
                .then(msgs => {
                    resolve(msgs.first());
                })
                .catch(err => {
                    console.log(`No response message received for ${timeout}ms`);
                });
        });
    }

    // all messages
    noFilter = (msg: Message) => true;

    // only messages from user with specific id
    fromUser = (userId: string) => (response: Message) => {
        return response.author.id === userId!;
    };

    async createTemporaryTextChannel(preferedName?: string) {
        let name = preferedName;

        if (!name) {
            name = `Running tests | created: (${new Date().toUTCString()})`;
        }

        await this.guild!.createChannel(name, { type: 'text' }).then(c => {
            this.channel = c as TextChannel;
        });
    }

    async deleteTemporaryTextChannel() {
        if (this.channel) {
            await this.channel.delete();
        }
    }
}
