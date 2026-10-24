import { createRouter } from '@tanstack/react-router'
import * as TanstackQuery from './integrations/tanstack-query/root-provider'
// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { APP_SCROLL_CONTAINER_ID } from './lib/navigation'

// Create a new router instance

export const getRouter = () => {
  const rqContext = TanstackQuery.getContext()

  const router = createRouter({
    routeTree,
    context: {
      ...rqContext,
      isAuthenticated: false,
      getAccessToken: async () => {
        return 'fake-token'
      },
    },

    defaultPreload: 'intent',
    scrollToTopSelectors: ['window', `#${APP_SCROLL_CONTAINER_ID}`],
    Wrap: ({ children }) => {
      return (
        <TanstackQuery.Provider queryClient={rqContext.queryClient}>
          {children}
        </TanstackQuery.Provider>
      )
    },
  })

  return router
}
