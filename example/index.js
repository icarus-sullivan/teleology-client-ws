import React, { useEffect, useState } from 'react';
import { hydrate } from 'react-dom';

import ws from '@teleology/client-ws';

import './style.css';

const client = ws({
  url: 'wss://hrix6cnamf.execute-api.us-east-1.amazonaws.com/dev',
  heartbeat: 5 * 60 * 1000,
});

const Render = () => {
  const [incoming, setIncoming] = useState([]);

  useEffect(() => {
    client.on('connected', () => {
      console.log('websocket connected');
    });
  }, []);

  return (
    <div className="container">
      <div className="incoming">
        {incoming.reduce((a, b) => `${a}\n${b}`, '')}
      </div>
      <button
        type="buttton"
        onClick={() => {
          client.on('greet', (data) => {
            setIncoming([...incoming, data]);
          });
        }}
      >
        Subscribe to Greet
      </button>
      <button
        type="buttton"
        onClick={() => {
          client.emit('greet', 'hello');
        }}
      >
        Emit greet
      </button>
    </div>
  );
};

hydrate(<Render />, document.body);
