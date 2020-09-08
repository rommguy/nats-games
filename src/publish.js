const topicName = 'myTopic';
const { readInput } = require('./readInput');
const { connect } = require('./utils');

const publish = async (nats, msg) => {
  return new Promise((resolve, reject) => {
    nats.publish(topicName, { data: msg }, (err) => {
      if (err) {
        console.error(`Failed to publish: ${err.message}`);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const main = async () => {
  let closed = false;
  const nats = await connect();
  console.log(`Publisher connected`);

  const close = () => {
    nats.close();
    closed = true;
    console.log('Publisher closed');
  };

  process.on('SIGTERM', () => {
    console.log(`Received SIGTERM`);
    close();
  });

  while (!closed) {
    try {
      const { msg } = await readInput('msg');

      if (msg.toLowerCase() === 'exit') {
        close();
      } else {
        console.log(`Publishing message: ${msg}`);
        await publish(nats, msg);
      }
    } catch (e) {
      close();
      console.error(`Error reading input, ${e.message}`);
    }
  }
};

main();
