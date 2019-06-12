var context = require.context('./js/epics', true, /-test\.jsx?$/);
context.keys().forEach(context);
module.exports = context;
