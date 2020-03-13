/* eslint-disable no-plusplus */
export default () => {
  let fns = [];
  return {
    add: (fn) => {
      if (typeof fn !== 'function') return;

      if (fns.indexOf(fn) < 0) {
        fns.push(fn);
      }
    },
    remove: (fn) => {
      if (typeof fn !== 'function') return;

      fns = fns.filter((a) => a !== fn);
    },
    broadcast: (message) =>
      fns.forEach((fn) =>
        fn(typeof message === 'string' ? `${message}` : message),
      ),
  };
};
