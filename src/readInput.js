const prompt = require('prompt');

const readInput = (inputName) => {
  return new Promise((resolve, reject) => {
    prompt.start();

    prompt.get([inputName], (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

module.exports = { readInput };
