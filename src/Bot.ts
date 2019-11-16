import Discord, { Guild, TextChannel, Message, VoiceChannel } from 'discord.js';

export default class Bot extends Discord.Client {
    private guild: Guild | undefined;
    private channel: TextChannel | undefined;
    private voiceChannel: VoiceChannel | undefined;

    constructor(token: string, guildId: string) {
        super();
        this.token = token;

        this.on('ready', () => {
            this.guild = this.guilds.get(guildId);
            if (!this.guild) {
                console.info(
                    `\nCan't find guild.\nTroubleshooting:\n\t- Update the guild id\n\t- Check that the testing bot is member of the testing guild`,
                );
                process.exit(1);
            }
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

    setVoiceChannel(voiceChannelId: string) {
        const c = this.channels.get(voiceChannelId);

        if (c instanceof VoiceChannel) {
            this.voiceChannel = c;
        }
    }

    async joinVoiceChannel() {
        if (this.voiceChannel!.joinable) {
            await this.voiceChannel!.join();
        }
    }

    getMessageFrom(content: string) {
        return this.sendMessage(content);
    }

    getResponseTo(content: string, timeout: number, userId?: string): Promise<Message> {
        return new Promise(async resolve => {
            await this.sendMessage(content);

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

    private sendMessage(content: string) {
        try {
            return this.channel!.send(content);
        } catch (error) {
            console.log('Error caught in getResponseTo():', error.message);
            console.info(
                `\nCan't find text channel.\nTroubleshooting:\n\t- Update the text channel id\n\t- Check that the testing bot is member of the testing guild\n\t- Check that the testing bot has admin rights`,
            );
            process.exit(1);
        }
    }
}
