![npm version](https://img.shields.io/npm/v/@teleology/client-ws.svg) ![npm license](https://img.shields.io/npm/l/@teleology/client-ws.svg)

# @teleology/client-ws
Client Websocket implementation for @teleology/lambda-ws

## Installation
```
npm install --save @teleology/client-ws
```
or
```
yarn add @teleology/client-ws
```


# Usage

```javascript
import ws from '@teleology/client-ws';

const client = ws({
  url: 'wss://hrix6cnamf.execute-api.us-east-1.amazonaws.com/dev',
  heartbeat: 5 * 60 * 1000,
});

// Websocket Events
client.on('connected', (WebsocketClient) => {});
client.on('error', () => {});
client.on('closed', () => {});

// Subscription
const unsub = client.subscribe('some_event', (payload) => {});


// Emit
client.emit('other_event', 'data');
```
 
## Changelog

**1.0.0**
- First version published