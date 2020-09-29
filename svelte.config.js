const sveltePreprocess = require('svelte-preprocess')

module.exports = {
  preprocess: sveltePreprocess({
    stylus: {
      paths: ['node_modules'],
    }
  }),
};
