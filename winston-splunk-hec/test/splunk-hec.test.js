require('abstract-winston-transport')({
    name: 'SplunkHec',
    Transport: require('../index')
  });