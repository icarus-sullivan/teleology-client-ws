import listener from './listener';

export default () => {
  const listeners = {};
  return {
    on: (event, fn) => {
      if (!listeners[event]) {
        listeners[event] = listener();
      }

      listeners[event].add(fn);
    },
    off: (event, fn) => {
      if (!listeners[event]) {
        listeners[event] = listener();
      }

      listeners[event].remove(fn);
    },
    emit: (event, message) => {
      if (listeners[event]) {
        listeners[event].broadcast(message);
      }
    },
  };
};
