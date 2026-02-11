import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { Auth0Provider } from '@auth0/auth0-react'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Elektroniczny Rejestr',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: './favicon.ico',
      },
    ],
  }),
  ssr: false,
  shellComponent: RootLayout,
})

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Auth0Provider
          domain={import.meta.env.VITE_AUTH0_DOMAIN || ''}
          clientId={import.meta.env.VITE_AUTH0_CLIENT_ID || ''}
          authorizationParams={{
            redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URI || '',
          }}
          useRefreshTokens={true}
          cacheLocation="localstorage"
        >
          {children}
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtools />,
              },
              TanStackQueryDevtools,
            ]}
          />
          <Scripts />
        </Auth0Provider>
      </body>
    </html>
  )
}
