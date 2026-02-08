import { jsx, jsxs } from "react/jsx-runtime";
import { createRootRouteWithContext, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Auth0Provider } from "@auth0/auth0-react";
function getContext() {
  const queryClient = new QueryClient();
  return {
    queryClient
  };
}
function Provider({
  children,
  queryClient
}) {
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children });
}
const appCss = "/animal-registry-frontend/assets/styles-Dt6dBjJO.css";
const Route$1 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        title: "Elektroniczny Rejestr"
      }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      },
      {
        rel: "icon",
        href: "./favicon.ico"
      }
    ]
  }),
  ssr: false,
  shellComponent: RootLayout
});
function RootLayout({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsx("body", { children: /* @__PURE__ */ jsxs(
      Auth0Provider,
      {
        domain: "https://hbcrew.eu.auth0.com",
        clientId: "5hLMVEXKG2UUw5Lkfvazx8oKi8hkYdzA",
        authorizationParams: {
          redirect_uri: "https://thepawject.github.io/animal-registry-frontend/"
        },
        useRefreshTokens: true,
        cacheLocation: "localstorage",
        children: [
          children,
          /* @__PURE__ */ jsx(Scripts, {})
        ]
      }
    ) })
  ] });
}
const $$splitComponentImporter = () => import("./index-BOyzY_z-.js");
const Route = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter, "component"),
  ssr: false
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$1
});
const rootRouteChildren = {
  IndexRoute
};
const routeTree = Route$1._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const rqContext = getContext();
  const router = createRouter({
    routeTree,
    basepath: "/animal-registry-frontend",
    context: {
      ...rqContext
    },
    defaultPreload: "intent",
    Wrap: ({ children }) => {
      return /* @__PURE__ */ jsx(Provider, { queryClient: rqContext.queryClient, children });
    }
  });
  return router;
};
export {
  getRouter
};
