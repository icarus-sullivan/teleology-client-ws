import simpleEvents from './events';

const OPEN_STATE = 1;
const DEFAULT_HEARTBEAT = 60 * 1000; // 60 seconds

export default ({ url, heartbeat = DEFAULT_HEARTBEAT, retry = true }) => {
  let client;
  let keepalive;
  const evt = simpleEvents();

  const send = (msg, stringify = true) => {
    if (client && client.readyState === OPEN_STATE)
      client.send(stringify ? JSON.stringify(msg) : msg);
  };

  const ping = () => send(`${0x9}`, false);

  const startKeepAlive = () => {
    keepalive = setInterval(ping, heartbeat);
  };

  const clearKeepAlive = () => {
    if (keepalive) clearInterval(keepalive);
    keepalive = undefined;
  };

  const onerror = (e) => evt.emit('error', e);

  const start = () => {
    try {
      client = new WebSocket(url);
      client.onopen = () => evt.emit('connected', client);
      client.onclose = (reasons) => evt.emit('closed', reasons);
      client.onmessage = ({ data }) => {
        try {
          const { type, payload } = JSON.parse(data);
          evt.emit(type, payload);
        } catch (e) {
          // do nothing
        }
      };
      client.onerror = onerror;
    } catch (e) {
      onerror(e);
    }
  };

  // Use internal connected event -- startKeepAlive
  evt.on('connected', startKeepAlive);

  // Listen for error, clear and try to restart
  evt.on('error', () => {
    clearKeepAlive();
    client = undefined;

    // retry when client is closed
    if (retry) {
      start();
    }
  });

  // wait a bit before starting the client
  setTimeout(() => {
    start();
  }, 1000);

  return {
    close: () => {
      if (client) {
        client.close();
      }
    },
    subscribe: (event, fn) => {
      evt.on(event, fn);
      send({
        op: 'subscribe',
        type: event,
      });
    },
    unsubscribe: (event, fn) => {
      evt.off(event, fn);
      send({
        op: 'unsubscribe',
        type: event,
      });
    },
    emit: (event, message) =>
      send({
        type: event,
        payload: message,
      }),
    on: evt.on.bind(evt),
  };
};
