# Discord Response Mock 

> Making the behavior of your discord bot testable.

<br/>
<p>
<a href="https://github.com/KaindlJulian/discord-response-mock/actions?query=workflow%3Abuild"><img alt="build" src="https://github.com/KaindlJulian/discord-response-mock/workflows/build/badge.svg"></a>
<a href="https://www.npmjs.com/package/discord-response-mock"><img alt="npm" src="https://img.shields.io/npm/v/discord-response-mock?color=blue&label=%20npm"></a>
</p>

## Prerequisites

-   ID of a discord guild to test in
-   The token of a bot application with admin rights on this guild
-   If you want to test a bot it should be running in a seperate process

For more information take a look at the [setup FAQ](guild_bot_setup.md).

## Getting started

**Install**

:exclamation: This package relies on the availability of the specified discord guild. **Do not use this in production code**.

```
npm install --save-dev discord-response-mock
```

## Examples

This examples are simplified. You need to call `.cleanup()` on the client to delete temporary channels and stop the test bot and wrap the `await`s in an `async`.

### Responses

**Basic**

```js
import { ResponseClient } from 'discord-response-mock';

const client = await new ResponseClient().setup('[YOUR_GUILD_ID]', '[YOUR_BOT_TOKEN]');

client.write('message content', response => {
    console.log(response.content);
});
```

**Mocha command test**

A test for a command of your discord bot could look like this.

```js
import assert from 'assert';
import { ResponseClient } from 'discord-response-mock';

const options = {
    messagePrefix: '!',
    specificUserId: '[YOUR_BOT_ID]',
}

let client;

before(done => {
    client = await new ResponseClient(options)
        .setup('[TEST_GUILD_ID]', '[TEST_BOT_TOKEN]');
    done();
});

describe('ping', () => {
    it('should respond with correct message', done => {
        client.write('ping', response => {
            assert.equal(response.content, 'pong');
            done();
        })
    });
});

after(done => {
    await client.cleanup();
    done();
});
```

### Mocking

**Message Object**

```js
import { MockClient } from 'discord-response-mock';

const mock = await new MockClient().setup('[YOUR_GUILD_ID]', '[YOUR_BOT_TOKEN]');

const message = await mock.message('message content');
```

## How it works

This package exports two classes. `ResponseClient` and `MockClient`. Both make use of a discord bot to programatically send and listen to messages.

### ResponseClient

Allows you to send a message to a channel and return the next message. By default this is the first message after the test bot sent its messgage. Also by default the bot will create a temporary text channel for each test setup which will be removed in the `.cleanup()` method. You can change different aspects via the `ResponseClientOptions`.

#### Options

```js
const opts = {
    /**
     * If set and a valid discord channelId, the tests will be performed on
     * this channel. Otherwise a tempory channel will be created.
     *
     * @type {string}
     * @memberof ResponseClientOptions
     */
    channelId,

    /**
     * Changes the name of the temporary testing channel.
     *
     * @type {string}
     * @memberof ResponseClientOptions
     */
    testChannelName,

    /**
     * Sets a timeout on how long to wait for responses. Can only be
     * between 100 and 10000 milliseconds.
     *
     * @type {number}
     * @memberof ResponseClientOptions
     * @default 5000
     */
    responseTimeout,

    /**
     * Sets a string that will be prefixed to each message
     *
     * @type {string}
     * @memberof ResponseClientOptions
     */
    messagePrefix,

    /**
     * If set, only use the responses from this userId. Others are
     * filtered out.
     * If this field is not set, the first response will be returned.
     *
     * @type {string}
     * @memberof ResponseClientOptions
     */
    specificUserId,
};
```

### MockClient

Allows you to mock different discord.js objects. This is achieved by creating a temporary channel and sending them message there.
