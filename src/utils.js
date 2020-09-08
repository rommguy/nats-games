const NATS = require('nats');

const natsOptions = {
  json: true,
  url: 'nats://localhost:4222',
  maxReconnectAttempts: 60,
  reconnectTimeWait: 2000,
  waitOnFirstConnect: true,
};

const waitFor = (time) => {
  console.log(`Waiting ${time}`);
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

const connect = async () => {
  return new Promise((resolve) => {
    const nats = NATS.connect(natsOptions);
    nats.on('error', (err) => {
      logger.error(`Error from nats: ${err.message}`);
    });
    nats.once('connect', () => {
      resolve(nats);
    });
  });
};

module.exports = { connect, waitFor };
