export const navLinkClassName =
  "relative flex-row items-center gap-2 whitespace-nowrap rounded-md bg-transparent px-3 py-1.5 text-base font-medium text-slate-600 transition-none hover:bg-transparent hover:text-slate-600 focus:bg-transparent focus:text-slate-600 data-[status=active]:text-slate-900 data-[status=active]:hover:text-slate-900 data-[status=active]:focus:text-slate-900 after:absolute after:inset-x-1 after:-bottom-1.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-slate-300 after:transition-transform after:duration-300 after:ease-out after:content-[''] hover:after:scale-x-100 focus-visible:after:scale-x-100 data-[status=active]:after:scale-x-100 data-[status=active]:after:bg-emerald-600 [&_svg:not([class*='text-'])]:text-slate-500 data-[status=active]:[&_svg:not([class*='text-'])]:text-emerald-600"

export const APP_SCROLL_CONTAINER_ID = 'app-scroll-container'

export const getAppScrollContainer = () =>
  document.getElementById(APP_SCROLL_CONTAINER_ID)
