module.exports = function() {
  return {
    files: [
      'lib/**/*.js',
      'index.js'
    ],

    tests: [
      'test/**/*.js'
    ],

    env: {
      type: 'node',
      runner: 'node'
    }
  };
};
