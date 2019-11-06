import Discord, { Guild, TextChannel, Message } from 'discord.js';

export default class TestBot extends Discord.Client {
    private guild: Guild | undefined;
    private channel: TextChannel | undefined;
    responsesFrom?: string;

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

    getResponseTo(content: string, timeout: number): Promise<Message> {
        return new Promise(async resolve => {
            await this.channel!.send(content);
            await this.channel!.awaitMessages(msg => msg, { max: 1, time: 5000, errors: ['time'] })
                .then(msgs => {
                    resolve(msgs.first());
                })
                .catch(err => {
                    console.log(`No response message received for ${timeout}ms`);
                });
        });
    }

    noFilter = (msg: Message) => true;

    responsesFromFilter = (response: Message) => {
        return response.author.id === this.responsesFrom!;
    };

    async createTemporaryChannel(preferedName?: string) {
        let name = preferedName;

        if (!name) {
            name = `Running tests | created: (${new Date().toUTCString()})`;
        }

        await this.guild!.createChannel(name, { type: 'text' }).then(c => {
            this.channel = c as TextChannel;
        });
    }

    async deleteTemporaryChannel() {
        if (this.channel) {
            await this.channel.delete();
        }
    }
}
