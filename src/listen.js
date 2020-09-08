const topicName = 'myTopic';
const { connect, waitFor } = require('./utils');

const subscribe = (nats, listener) => {
  const subscription = nats.subscribe(topicName, {}, async (msg) => {
    try {
      await listener(msg);
    } catch (e) {
      console.error(`error handling request from nats topic ${topicName}`);
    }
  });
  return new Promise((resolve) => {
    nats.flush(() => {
      console.log(`Subscribed to nats topic ${topicName}`);
      resolve(subscription);
    });
  });
};

const drain = (nats, subscription) => {
  return new Promise((resolve, reject) => {
    nats.drainSubscription(subscription, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Draining done`);
        resolve();
      }
    });
  });
};
const flushAndClose = (nats) => {
  return new Promise((resolve) => {
    nats.flush(() => {
      console.log(`Flush done, closing nats`);
      nats.close();
      console.log(`Flush and Close done`);
      resolve();
    });
  });
};
const blockForTime = (time) => {
  const start = Date.now();
  let now = Date.now();
  while (now - start < time) {
    now = Date.now();
  }
};

const main = async () => {
  let closed = false;
  const nats = await connect();
  console.log(`Listener connected`);

  const subscription = subscribe(nats, async (msg) => {
    console.log(`Received msg: ${msg.data}`);
    if (msg.data === 'drain') {
      // nats.unsubscribe(subscription);
      console.log(`Draining`);
      await drain(nats, subscription);
      await flushAndClose(nats);
    } else {
      blockForTime(3000);
    }
    console.log(`Done processing message ${msg.data}`);
  });

  const closeListener = () => {
    console.log('Listener closing...');
    nats.unsubscribe(subscription);
    nats.close();
    console.log('Listener closed');
    closed = true;
  };

  process.on('SIGTERM', () => {
    console.log('Listener received SIGTERM');
    closeListener();
  });

  // process.on('SIGKILL', () => {
  //   console.log('Listener received SIGKILL');
  //   closeListener();
  // });

  // while (!closed) {
  //   try {
  //     await waitFor(1000);
  //   } catch (e) {
  //     closeListener();
  //   }
  // }
};

main();
