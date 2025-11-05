import { initBotId } from 'botid/client/core';

// Define the paths that need bot protection.
// These are paths that are routed to by your app.
initBotId({
  protect: [
    {
      path: '/api/session',
      method: 'POST',
    },
    {
      // Wildcards can be used at the end for dynamic routes
      path: '/api/session/*/join',
      method: 'POST',
    },
    {
      path: '/api/session/*/vote',
      method: 'POST',
    },
    {
      path: '/api/session/*/reveal',
      method: 'POST',
    },
    {
      path: '/api/session/*/reset',
      method: 'POST',
    },
  ],
});
