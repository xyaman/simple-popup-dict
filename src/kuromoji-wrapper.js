// Source: https://github.com/azu/kuromojin

const kuromoji = require('@sglkc/kuromoji');

/**
 * @typedef {Object} Tokenizer
 * @property {function(string): kuromoji.IpadicFeatures[]} tokenize - Function to tokenize a given text.
 */

/**
 * Class representing a deferred operation that resolves to a Tokenizer.
 * @class
 */
class Deferred {
  constructor() {
    /**
     * @type {Promise<Tokenizer>}
     */
    this.promise = new Promise((resolve, reject) => {
      /**
       * @type {function(Tokenizer): void}
       */
      this.resolve = resolve;

      /**
       * @type {function(Error): void}
       */
      this.reject = reject;
    });
  }
}

const deferred = new Deferred();
let isLoading = false;

/**
 * Asynchronously loads and returns a Tokenizer instance.
 * @returns {Promise<Tokenizer>} A promise that resolves to a Tokenizer instance.
 */
const getTokenizer = (dicPath) => {
  if (isLoading) {
    return deferred.promise;
  }
  isLoading = true;

  const builder = kuromoji.builder({
    dicPath: dicPath || 'dict/',
  });

  builder.build((err, tokenizer) => {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(tokenizer);
    }
  });

  return deferred.promise;
};

exports.getTokenizer = getTokenizer;
