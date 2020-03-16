import simpleEvents from './events';

const OPEN_STATE = 1;
const DEFAULT_HEARTBEAT = 60 * 1000; // 60 seconds
const NON_SUBSCRIPTION_EVENTS = ['connected', 'closed', 'error'];

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

  const off = (event, fn) => {
    evt.off(event, fn);
    if (!NON_SUBSCRIPTION_EVENTS.includes(event)) {
      send({
        op: 'unsubscribe',
        type: event,
      });
    }
  };

  const on = (event, fn) => {
    evt.on(event, fn);
    if (!NON_SUBSCRIPTION_EVENTS.includes(event)) {
      send({
        op: 'subscribe',
        type: event,
      });
    }
  };

  return {
    close: () => {
      if (client) {
        client.close();
      }
    },
    subscribe: (event, fn) => {
      on(event, fn);
      return () => off(event, fn);
    },
    emit: (event, message) =>
      send({
        type: event,
        payload: message,
      }),
    off,
    on,
  };
};
