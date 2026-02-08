import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useAuth0 } from "@auth0/auth0-react";
import * as React from "react";
import React__default, { useState, useEffect } from "react";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { ArrowLeft, ArrowRight, XIcon, ChevronDownIcon, CheckIcon, ChevronUpIcon, Eye, Pencil, Stethoscope } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import useEmblaCarousel from "embla-carousel-react";
import { Dialog as Dialog$1 } from "radix-ui";
import { createFormHookContexts, useStore, createFormHook } from "@tanstack/react-form";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as LabelPrimitive from "@radix-ui/react-label";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "@tanstack/react-router";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error("Invalid JWT token:", error);
    return null;
  }
}
function getShelterName(decodedToken) {
  const roles = decodedToken["https://ThePawject/roles"];
  const shelterName = roles.find(
    (role) => role.startsWith("Shelter_Access_")
  );
  return shelterName ? shelterName.replace("Shelter_Access_", "") : null;
}
function getRoles(decodedToken) {
  return decodedToken["https://ThePawject/roles"] || [];
}
const origin = typeof window !== "undefined" ? window.location.origin : null;
function getOriginHomePage() {
  if (!origin) return null;
  return `${origin}/animal-registry-frontend/`;
}
function getAuthorizationParams() {
  return {
    scope: "openid offline_access",
    audience: "https://dev-ThePawject/"
  };
}
function Card({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card",
      className: cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      ),
      ...props
    }
  );
}
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive: "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "badge",
      className: cn(badgeVariants({ variant }), className),
      ...props
    }
  );
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "button",
      "data-variant": variant,
      "data-size": size,
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
const CarouselContext = React.createContext(null);
function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}
function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y"
    },
    plugins
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const onSelect = React.useCallback((api2) => {
    if (!api2) return;
    setCanScrollPrev(api2.canScrollPrev());
    setCanScrollNext(api2.canScrollNext());
  }, []);
  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);
  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);
  const handleKeyDown = React.useCallback(
    (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );
  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);
  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);
  return /* @__PURE__ */ jsx(
    CarouselContext.Provider,
    {
      value: {
        carouselRef,
        api,
        opts,
        orientation: (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal")
        ),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext
      },
      children: /* @__PURE__ */ jsx(
        "div",
        {
          onKeyDownCapture: handleKeyDown,
          className: cn("relative", className),
          role: "region",
          "aria-roledescription": "carousel",
          "data-slot": "carousel",
          ...props,
          children
        }
      )
    }
  );
}
function CarouselContent({ className, ...props }) {
  const { carouselRef, orientation } = useCarousel();
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: carouselRef,
      className: "overflow-hidden",
      "data-slot": "carousel-content",
      children: /* @__PURE__ */ jsx(
        "div",
        {
          className: cn(
            "flex",
            orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
            className
          ),
          ...props
        }
      )
    }
  );
}
function CarouselItem({ className, ...props }) {
  const { orientation } = useCarousel();
  return /* @__PURE__ */ jsx(
    "div",
    {
      role: "group",
      "aria-roledescription": "slide",
      "data-slot": "carousel-item",
      className: cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      ),
      ...props
    }
  );
}
function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  return /* @__PURE__ */ jsxs(
    Button,
    {
      "data-slot": "carousel-previous",
      variant,
      type: "button",
      size,
      className: cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal" ? "top-1/2 -left-12 -translate-y-1/2" : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      ),
      disabled: !canScrollPrev,
      onClick: scrollPrev,
      ...props,
      children: [
        /* @__PURE__ */ jsx(ArrowLeft, {}),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Previous slide" })
      ]
    }
  );
}
function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  return /* @__PURE__ */ jsxs(
    Button,
    {
      "data-slot": "carousel-next",
      variant,
      type: "button",
      size,
      className: cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal" ? "top-1/2 -right-12 -translate-y-1/2" : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      ),
      disabled: !canScrollNext,
      onClick: scrollNext,
      ...props,
      children: [
        /* @__PURE__ */ jsx(ArrowRight, {}),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Next slide" })
      ]
    }
  );
}
function Dialog({
  ...props
}) {
  return /* @__PURE__ */ jsx(Dialog$1.Root, { "data-slot": "dialog", ...props });
}
function DialogPortal({
  ...props
}) {
  return /* @__PURE__ */ jsx(Dialog$1.Portal, { "data-slot": "dialog-portal", ...props });
}
function DialogClose({
  ...props
}) {
  return /* @__PURE__ */ jsx(Dialog$1.Close, { "data-slot": "dialog-close", ...props });
}
function DialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Dialog$1.Overlay,
    {
      "data-slot": "dialog-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}) {
  return /* @__PURE__ */ jsxs(DialogPortal, { "data-slot": "dialog-portal", children: [
    /* @__PURE__ */ jsx(DialogOverlay, {}),
    /* @__PURE__ */ jsxs(
      Dialog$1.Content,
      {
        "data-slot": "dialog-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-10 shadow-2xl duration-200 outline-none max-w-[1024px] max-h-[90vh] overflow-y-auto",
          className
        ),
        ...props,
        children: [
          children,
          showCloseButton && /* @__PURE__ */ jsxs(
            Dialog$1.Close,
            {
              "data-slot": "dialog-close",
              className: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              children: [
                /* @__PURE__ */ jsx(XIcon, {}),
                /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
              ]
            }
          )
        ]
      }
    )
  ] });
}
function DialogHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "dialog-header",
      className: cn("flex flex-col gap-2 text-center sm:text-left", className),
      ...props
    }
  );
}
function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "data-slot": "dialog-footer",
      className: cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      ),
      ...props,
      children: [
        children,
        showCloseButton && /* @__PURE__ */ jsx(Dialog$1.Close, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "Close" }) })
      ]
    }
  );
}
function DialogTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Dialog$1.Title,
    {
      "data-slot": "dialog-title",
      className: cn("text-lg leading-none font-semibold", className),
      ...props
    }
  );
}
function DialogDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Dialog$1.Description,
    {
      "data-slot": "dialog-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
const STATUS_COLOR = {
  available: "bg-green-100 text-green-800",
  adopted: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  medical: "bg-red-100 text-red-800"
};
const demoImages = [
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
  "https://images.unsplash.com/photo-1517849845537-4d257902454a",
  "https://images.unsplash.com/photo-1507146426996-ef05306b995a",
  "https://images.unsplash.com/photo-1558788353-f76d92427f16"
];
function formatDate$1(date) {
  if (!date) return "-";
  try {
    if (typeof date === "string" || typeof date === "number")
      return new Date(date).toLocaleDateString();
    if (date instanceof Date) return date.toLocaleDateString();
  } catch {
    return String(date);
  }
  return String(date);
}
function AnimalViewTab({
  animal,
  open,
  onClose
}) {
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  const imageUrls = demoImages;
  return /* @__PURE__ */ jsx(
    Dialog,
    {
      open,
      onOpenChange: (open2) => {
        if (!open2) onClose();
      },
      children: /* @__PURE__ */ jsx(
        DialogContent,
        {
          showCloseButton: false,
          className: "p-0 bg-transparent shadow-none border-none max-w-fit",
          children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                className: "absolute z-10 top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:outline-none bg-white dark:bg-zinc-900 p-2",
                "aria-label": "Close",
                children: /* @__PURE__ */ jsx(XIcon, { className: "w-5 h-5" })
              }
            ) }),
            /* @__PURE__ */ jsx(Card, { className: "max-w-none w-full p-8 rounded-2xl shadow-md bg-white dark:bg-zinc-900", children: /* @__PURE__ */ jsxs("div", { className: "md:flex gap-8 items-center", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[260px]", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center mb-6", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold mr-4", children: animal.name }),
                  /* @__PURE__ */ jsx(
                    Badge,
                    {
                      variant: "outline",
                      className: STATUS_COLOR[animal.status] + " text-lg px-4 py-2 capitalize ring-1 ring-inset ring-gray-300",
                      children: animal.status
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("table", { className: "w-full border-separate border-spacing-0 text-base rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxs("tbody", { children: [
                  /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(
                    "td",
                    {
                      colSpan: 2,
                      className: "px-0 pb-2 pt-2 font-bold text-lg text-gray-900 dark:text-gray-100 bg-transparent border-b border-gray-200 dark:border-zinc-600",
                      children: "Informacje podstawowe"
                    }
                  ) }),
                  /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 dark:border-zinc-700", children: [
                    /* @__PURE__ */ jsx("td", { className: "w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4", children: "ID" }),
                    /* @__PURE__ */ jsx("td", { className: "font-mono text-gray-900 dark:text-gray-50 py-2", children: animal.animalId })
                  ] }),
                  /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 dark:border-zinc-700", children: [
                    /* @__PURE__ */ jsx("td", { className: "w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4", children: "Gatunek" }),
                    /* @__PURE__ */ jsx("td", { className: "text-gray-900 dark:text-gray-50 py-2", children: animal.type })
                  ] }),
                  /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 dark:border-zinc-700", children: [
                    /* @__PURE__ */ jsx("td", { className: "w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4", children: "Rasa" }),
                    /* @__PURE__ */ jsx("td", { className: "text-gray-900 dark:text-gray-50 py-2", children: animal.breed })
                  ] }),
                  /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 dark:border-zinc-700", children: [
                    /* @__PURE__ */ jsx("td", { className: "w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4", children: "Wiek" }),
                    /* @__PURE__ */ jsxs("td", { className: "text-gray-900 dark:text-gray-50 py-2", children: [
                      animal.age,
                      " lat"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("td", { className: "w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4", children: "Data przyjęcia" }),
                    /* @__PURE__ */ jsx("td", { className: "text-gray-900 dark:text-gray-50 py-2", children: formatDate$1(animal.admissionDate) })
                  ] }),
                  /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(
                    "td",
                    {
                      colSpan: 2,
                      className: "pt-6 pb-2 font-bold text-lg text-gray-900 dark:text-gray-100 bg-transparent border-b border-gray-200 dark:border-zinc-600",
                      children: "Informacje dodatkowe"
                    }
                  ) }),
                  /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 dark:border-zinc-700", children: [
                    /* @__PURE__ */ jsx("td", { className: "w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4", children: "Zarejestrowany numer mikroczipu (uniwersalny)" }),
                    /* @__PURE__ */ jsx("td", { className: "text-gray-900 dark:text-gray-50 py-2", children: "985 112 014 875 596" })
                  ] }),
                  /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 dark:border-zinc-700", children: [
                    /* @__PURE__ */ jsx("td", { className: "w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4", children: "Opiekun / Osoba rozpatrująca adopcję" }),
                    /* @__PURE__ */ jsx("td", { className: "text-gray-900 dark:text-gray-50 py-2", children: "Samantha Peterson" })
                  ] }),
                  /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 dark:border-zinc-700", children: [
                    /* @__PURE__ */ jsx("td", { className: "w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4", children: "Data ostatniej kontroli weterynaryjnej" }),
                    /* @__PURE__ */ jsx("td", { className: "text-gray-900 dark:text-gray-50 py-2", children: "12 January 2026" })
                  ] }),
                  /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 dark:border-zinc-700", children: [
                    /* @__PURE__ */ jsx("td", { className: "w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4", children: "Ograniczenia żywieniowe i uwagi" }),
                    /* @__PURE__ */ jsx("td", { className: "text-gray-900 dark:text-gray-50 py-2", children: "Grain-free, no chicken protein" })
                  ] }),
                  /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("td", { className: "w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4", children: "Najdłuższy ciągły pobyt w domu tymczasowym" }),
                    /* @__PURE__ */ jsx("td", { className: "text-gray-900 dark:text-gray-50 py-2", children: "9 months" })
                  ] })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mb-8 md:mb-0 flex flex-col items-center w-104 px-8", children: [
                /* @__PURE__ */ jsxs(
                  Carousel,
                  {
                    setApi,
                    opts: { align: "center", loop: true },
                    className: "w-full",
                    children: [
                      /* @__PURE__ */ jsx(CarouselContent, { children: imageUrls.map((url, idx) => /* @__PURE__ */ jsx(
                        CarouselItem,
                        {
                          className: "flex justify-center items-center h-64",
                          children: /* @__PURE__ */ jsx(
                            "img",
                            {
                              src: url,
                              alt: `Animal slide ${idx + 1}`,
                              className: "rounded-xl shadow-lg object-cover w-64 h-64 mx-auto"
                            }
                          )
                        },
                        url
                      )) }),
                      /* @__PURE__ */ jsx(CarouselPrevious, {}),
                      /* @__PURE__ */ jsx(CarouselNext, {})
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "text-muted-foreground py-2 text-center text-sm", children: [
                  "Slajd ",
                  current,
                  " z ",
                  count
                ] })
              ] })
            ] }) })
          ] })
        }
      )
    }
  );
}
const { fieldContext, useFieldContext, formContext, useFormContext } = createFormHookContexts();
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      "data-slot": "input",
      className: cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      ),
      ...props
    }
  );
}
function Textarea({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      "data-slot": "textarea",
      className: cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ...props
    }
  );
}
function Select$1({
  ...props
}) {
  return /* @__PURE__ */ jsx(SelectPrimitive.Root, { "data-slot": "select", ...props });
}
function SelectGroup({
  ...props
}) {
  return /* @__PURE__ */ jsx(SelectPrimitive.Group, { "data-slot": "select-group", ...props });
}
function SelectValue({
  ...props
}) {
  return /* @__PURE__ */ jsx(SelectPrimitive.Value, { "data-slot": "select-value", ...props });
}
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    SelectPrimitive.Trigger,
    {
      "data-slot": "select-trigger",
      "data-size": size,
      className: cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDownIcon, { className: "size-4 opacity-50" }) })
      ]
    }
  );
}
function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}) {
  return /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
    SelectPrimitive.Content,
    {
      "data-slot": "select-content",
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
        position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      ),
      position,
      align,
      ...props,
      children: [
        /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
        /* @__PURE__ */ jsx(
          SelectPrimitive.Viewport,
          {
            className: cn(
              "p-1",
              position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
            ),
            children
          }
        ),
        /* @__PURE__ */ jsx(SelectScrollDownButton, {})
      ]
    }
  ) });
}
function SelectLabel({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SelectPrimitive.Label,
    {
      "data-slot": "select-label",
      className: cn("text-muted-foreground px-2 py-1.5 text-xs", className),
      ...props
    }
  );
}
function SelectItem({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    SelectPrimitive.Item,
    {
      "data-slot": "select-item",
      className: cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            "data-slot": "select-item-indicator",
            className: "absolute right-2 flex size-3.5 items-center justify-center",
            children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(CheckIcon, { className: "size-4" }) })
          }
        ),
        /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
      ]
    }
  );
}
function SelectScrollUpButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SelectPrimitive.ScrollUpButton,
    {
      "data-slot": "select-scroll-up-button",
      className: cn(
        "flex cursor-default items-center justify-center py-1",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(ChevronUpIcon, { className: "size-4" })
    }
  );
}
function SelectScrollDownButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SelectPrimitive.ScrollDownButton,
    {
      "data-slot": "select-scroll-down-button",
      className: cn(
        "flex cursor-default items-center justify-center py-1",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(ChevronDownIcon, { className: "size-4" })
    }
  );
}
function Label({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    LabelPrimitive.Root,
    {
      "data-slot": "label",
      className: cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
function SubscribeButton({ label }) {
  const form = useFormContext();
  return /* @__PURE__ */ jsx(form.Subscribe, { selector: (state) => state.isSubmitting, children: (isSubmitting) => /* @__PURE__ */ jsx(Button, { type: "submit", disabled: isSubmitting, children: label }) });
}
function ErrorMessages({
  errors
}) {
  return /* @__PURE__ */ jsx(Fragment, { children: errors.map((error) => /* @__PURE__ */ jsx(
    "div",
    {
      className: "text-red-500 mt-1 font-bold",
      children: typeof error === "string" ? error : error.message
    },
    typeof error === "string" ? error : error.message
  )) });
}
function TextField({
  label,
  placeholder
}) {
  const field = useFieldContext();
  const errors = useStore(field.store, (state) => state.meta.errors);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Label, { htmlFor: label, className: "mb-2 text-xl font-bold", children: label }),
    /* @__PURE__ */ jsx(
      Input,
      {
        value: field.state.value,
        placeholder,
        onBlur: field.handleBlur,
        onChange: (e) => field.handleChange(e.target.value)
      }
    ),
    field.state.meta.isTouched && /* @__PURE__ */ jsx(ErrorMessages, { errors })
  ] });
}
function TextArea({
  label,
  rows = 3
}) {
  const field = useFieldContext();
  const errors = useStore(field.store, (state) => state.meta.errors);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Label, { htmlFor: label, className: "mb-2 text-xl font-bold", children: label }),
    /* @__PURE__ */ jsx(
      Textarea,
      {
        id: label,
        value: field.state.value,
        onBlur: field.handleBlur,
        rows,
        onChange: (e) => field.handleChange(e.target.value)
      }
    ),
    field.state.meta.isTouched && /* @__PURE__ */ jsx(ErrorMessages, { errors })
  ] });
}
function Select({
  label,
  values,
  placeholder
}) {
  const field = useFieldContext();
  const errors = useStore(field.store, (state) => state.meta.errors);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Label, { htmlFor: label, className: "mb-2 text-xl font-bold", children: label }),
    /* @__PURE__ */ jsxs(
      Select$1,
      {
        name: field.name,
        value: field.state.value,
        onValueChange: (value) => field.handleChange(value),
        children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsx(SelectValue, { placeholder }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: /* @__PURE__ */ jsxs(SelectGroup, { children: [
            /* @__PURE__ */ jsx(SelectLabel, { children: label }),
            values.map((value) => /* @__PURE__ */ jsx(SelectItem, { value: value.value, children: value.label }, value.value))
          ] }) })
        ]
      }
    ),
    field.state.meta.isTouched && /* @__PURE__ */ jsx(ErrorMessages, { errors })
  ] });
}
const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    Select,
    TextArea
  },
  formComponents: {
    SubscribeButton
  },
  fieldContext,
  formContext
});
const ANIMAL_TYPES = ["dog", "cat", "bird", "rabbit", "other"];
const STATUSES = ["available", "adopted", "pending", "medical"];
function formatDate(date) {
  if (!date) return "";
  try {
    if (typeof date === "string" || typeof date === "number")
      return new Date(date).toISOString().slice(0, 10);
    if (date instanceof Date) return date.toISOString().slice(0, 10);
  } catch {
    return String(date);
  }
  return String(date);
}
function AnimalEditTab({
  animal,
  open,
  onClose
}) {
  const form = useAppForm({
    defaultValues: {
      name: animal.name || "",
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      type: animal.type || ANIMAL_TYPES[0],
      breed: animal.breed || "",
      age: animal.age.toString() || "0",
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      status: animal.status || STATUSES[0],
      admissionDate: formatDate(animal.admissionDate)
    },
    onSubmit: ({ value }) => {
      alert(`Zwierze dodano:  ${JSON.stringify(value, null, 2)}`);
    }
  });
  const [images, setImages] = React__default.useState([]);
  const [mainImageId, setMainImageId] = React__default.useState(0);
  const inputRef = React__default.useRef(null);
  const handleUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newImgs = files.map((file) => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setImages((prev) => [...prev, ...newImgs]);
    if (images.length === 0 && newImgs.length > 0) setMainImageId(0);
    e.target.value = "";
  };
  const removeImage = (idx) => {
    setImages((imgs) => {
      const imgsCopy = imgs.slice();
      URL.revokeObjectURL(imgsCopy[idx].url);
      imgsCopy.splice(idx, 1);
      if (mainImageId >= imgsCopy.length)
        setMainImageId(Math.max(0, imgsCopy.length - 1));
      return imgsCopy;
    });
  };
  React__default.useEffect(
    () => () => {
      images.forEach((img) => URL.revokeObjectURL(img.url));
    },
    [images]
  );
  const slidesToShow = Math.min(2, images.length);
  const slidesWidth = `${100 / slidesToShow}%`;
  return /* @__PURE__ */ jsx(
    Dialog,
    {
      open,
      onOpenChange: (open2) => {
        if (!open2) onClose();
      },
      children: /* @__PURE__ */ jsx(
        DialogContent,
        {
          showCloseButton: false,
          className: "p-0 bg-transparent shadow-none border-none max-w-6xl",
          children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                className: "absolute z-10 top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:outline-none bg-white dark:bg-zinc-900 p-2",
                "aria-label": "Close",
                children: /* @__PURE__ */ jsx(XIcon, { className: "w-5 h-5" })
              }
            ) }),
            /* @__PURE__ */ jsx(Card, { className: "max-w-none w-full p-8 rounded-2xl shadow-md bg-white dark:bg-zinc-900", children: /* @__PURE__ */ jsxs(
              "form",
              {
                onSubmit: (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                },
                className: "md:flex gap-8 items-center",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-8 md:mb-0 flex flex-col w-104 px-8 gap-4", children: [
                    /* @__PURE__ */ jsxs("h2", { className: "text-3xl font-bold mr-4", children: [
                      "Edytuj: ",
                      animal.name || "(imię)"
                    ] }),
                    /* @__PURE__ */ jsx(
                      form.AppField,
                      {
                        name: "name",
                        validators: {
                          onChange: ({ value }) => {
                            if (!value || value.trim().length === 0) {
                              return "Nazwa jest wymagana";
                            }
                            return void 0;
                          }
                        },
                        children: (field) => /* @__PURE__ */ jsx(field.TextField, { label: "Imię" })
                      }
                    ),
                    /* @__PURE__ */ jsx(form.AppField, { name: "type", children: (field) => /* @__PURE__ */ jsx(
                      field.Select,
                      {
                        label: "Gatunek",
                        values: ANIMAL_TYPES.map((t) => ({
                          label: t.charAt(0).toUpperCase() + t.slice(1),
                          value: t
                        })),
                        placeholder: "Wybierz gatunek"
                      }
                    ) }),
                    /* @__PURE__ */ jsx(form.AppField, { name: "breed", children: (field) => /* @__PURE__ */ jsx(field.TextField, { label: "Rasa" }) }),
                    /* @__PURE__ */ jsx(form.AppField, { name: "age", children: (field) => /* @__PURE__ */ jsx(field.TextField, { label: "Wiek", placeholder: "0" }) }),
                    /* @__PURE__ */ jsx(form.AppField, { name: "status", children: (field) => /* @__PURE__ */ jsx(
                      field.Select,
                      {
                        label: "Status",
                        values: STATUSES.map((s) => ({
                          label: s.charAt(0).toUpperCase() + s.slice(1),
                          value: s
                        })),
                        placeholder: "Wybierz status"
                      }
                    ) }),
                    /* @__PURE__ */ jsx(form.AppField, { name: "admissionDate", children: (field) => /* @__PURE__ */ jsx(
                      field.TextField,
                      {
                        label: "Data przyjęcia",
                        placeholder: "RRRR-MM-DD"
                      }
                    ) }),
                    /* @__PURE__ */ jsxs("div", { className: "flex gap-6 mt-8 items-center", children: [
                      /* @__PURE__ */ jsx(
                        Button,
                        {
                          type: "submit",
                          className: "text-xl px-8 py-4 font-bold bg-indigo-600 hover:bg-indigo-700 text-white",
                          children: "Zapisz"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        Button,
                        {
                          type: "button",
                          variant: "outline",
                          className: "text-xl px-8 py-4 font-bold border-gray-300",
                          onClick: onClose,
                          children: "Anuluj"
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[260px] px-8", children: [
                    /* @__PURE__ */ jsx("div", { className: "relative mb-4 flex items-center justify-center", children: images.length ? /* @__PURE__ */ jsxs(
                      Carousel,
                      {
                        opts: {
                          startIndex: mainImageId,
                          slidesToScroll: slidesToShow
                        },
                        children: [
                          /* @__PURE__ */ jsx(CarouselContent, { children: images.map((img, idx) => /* @__PURE__ */ jsxs(
                            CarouselItem,
                            {
                              className: "group relative h-96 flex justify-center items-center select-none",
                              style: { flex: `0 0 ${slidesWidth}` },
                              children: [
                                /* @__PURE__ */ jsx(
                                  "img",
                                  {
                                    src: img.url,
                                    alt: idx === mainImageId ? "Main animal preview" : "Animal image",
                                    className: `rounded-xl shadow-lg object-cover w-96 h-96 border-4 ${idx === mainImageId ? "border-indigo-500" : "border-transparent"}`
                                  }
                                ),
                                idx === mainImageId ? /* @__PURE__ */ jsx(Badge, { className: "absolute left-6 top-2 text-xs bg-indigo-100 text-indigo-700 py-2", children: "Główne zdjęcie" }) : /* @__PURE__ */ jsx(
                                  Button,
                                  {
                                    type: "button",
                                    variant: "secondary",
                                    size: "sm",
                                    className: "opacity-0 hover:opacity-100 group-hover:opacity-100 absolute left-6 top-2 text-xs transition-opacity duration-200",
                                    onClick: () => setMainImageId(idx),
                                    children: "Ustaw jako główne"
                                  }
                                ),
                                /* @__PURE__ */ jsx(
                                  Button,
                                  {
                                    type: "button",
                                    variant: "destructive",
                                    size: "sm",
                                    className: "opacity-0 group-hover:opacity-100 absolute right-2 top-2 text-xs transition-opacity duration-200",
                                    onClick: () => removeImage(idx),
                                    children: "Usuń"
                                  }
                                )
                              ]
                            },
                            idx
                          )) }),
                          /* @__PURE__ */ jsx(CarouselPrevious, {}),
                          /* @__PURE__ */ jsx(CarouselNext, {})
                        ]
                      }
                    ) : /* @__PURE__ */ jsx("div", { className: "size-96 rounded-xl flex items-center justify-center bg-gray-100 text-gray-400 text-xl shadow-inner", children: "Brak zdjęcia" }) }),
                    /* @__PURE__ */ jsx(
                      Button,
                      {
                        type: "button",
                        className: "py-3 px-6 text-lg w-full",
                        onClick: () => inputRef.current?.click(),
                        children: "Wgraj zdjęcia"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "file",
                        multiple: true,
                        accept: "image/*",
                        hidden: true,
                        ref: inputRef,
                        onChange: handleUpload
                      }
                    )
                  ] })
                ]
              }
            ) })
          ] })
        }
      )
    }
  );
}
function AnimalMedicalNotesTab({
  animalId: _animalId,
  open,
  onClose
}) {
  const [notes, setNotes] = React__default.useState([]);
  const [newNote, setNewNote] = React__default.useState("");
  const [newDate, setNewDate] = React__default.useState("");
  const handleAdd = () => {
    if (!newNote || !newDate) return;
    setNotes((n) => [...n, { id: Date.now(), note: newNote, date: newDate }]);
    setNewNote("");
    setNewDate("");
  };
  const handleRemove = (id) => setNotes((ns) => ns.filter((n) => n.id !== id));
  const columns = React__default.useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: (info) => info.getValue(),
        size: 80
      },
      {
        accessorKey: "note",
        header: "Notatka",
        cell: (info) => /* @__PURE__ */ jsx("span", { className: "max-w-xs break-words block", children: info.getValue() })
      },
      {
        accessorKey: "date",
        header: "Data",
        cell: (info) => {
          const value = info.getValue();
          return value ? new Date(value).toLocaleDateString() : "";
        },
        size: 120
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => /* @__PURE__ */ jsx(
          Button,
          {
            variant: "destructive",
            size: "sm",
            onClick: () => handleRemove(row.original.id),
            className: "sm:min-w-[120px] min-w-full",
            children: "Usuń notatkę"
          }
        ),
        enableSorting: false,
        enableHiding: false,
        size: 130
      }
    ],
    []
  );
  const table = useReactTable({
    data: notes,
    columns,
    getCoreRowModel: getCoreRowModel()
  });
  return /* @__PURE__ */ jsx(
    Dialog,
    {
      open,
      onOpenChange: (open2) => {
        if (!open2) onClose();
      },
      children: /* @__PURE__ */ jsx(
        DialogContent,
        {
          showCloseButton: false,
          className: "p-0 bg-transparent shadow-none border-none max-w-fit",
          children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                className: "absolute z-10 top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:outline-none bg-white dark:bg-zinc-900 p-2",
                "aria-label": "Close",
                children: /* @__PURE__ */ jsx(XIcon, { className: "w-5 h-5" })
              }
            ) }),
            /* @__PURE__ */ jsxs(Card, { className: "max-w-3xl w-full p-8 rounded-2xl shadow-md bg-white dark:bg-zinc-900", children: [
              /* @__PURE__ */ jsx("div", { className: "mb-8 flex items-center justify-between", children: /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "Notatki medyczne" }) }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-full w-full", children: [
                /* @__PURE__ */ jsx("div", { className: "rounded-md border bg-white dark:bg-black/30 overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
                  /* @__PURE__ */ jsx("thead", { children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx("tr", { children: headerGroup.headers.map((header) => /* @__PURE__ */ jsx(
                    "th",
                    {
                      className: "border-b bg-muted/50 px-4 py-3 text-left font-semibold text-sm",
                      children: header.isPlaceholder ? null : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    },
                    header.id
                  )) }, headerGroup.id)) }),
                  /* @__PURE__ */ jsx("tbody", { children: notes.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(
                    "td",
                    {
                      colSpan: columns.length,
                      className: "h-20 text-center text-muted-foreground",
                      children: "Brak notatek."
                    }
                  ) }) : table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx(
                    "tr",
                    {
                      className: "border-b transition-colors hover:bg-muted/50",
                      children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx(
                        "td",
                        {
                          className: "px-4 py-3 align-middle",
                          children: flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        },
                        cell.id
                      ))
                    },
                    row.id
                  )) })
                ] }) }),
                /* @__PURE__ */ jsxs(
                  "form",
                  {
                    className: "flex flex-wrap gap-4 items-end",
                    onSubmit: (e) => {
                      e.preventDefault();
                      handleAdd();
                    },
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "w-full sm:w-auto flex-1 min-w-[200px]", children: [
                        /* @__PURE__ */ jsx("label", { className: "block font-semibold mb-2 text-sm", children: "Notatka" }),
                        /* @__PURE__ */ jsx(
                          Input,
                          {
                            value: newNote,
                            onChange: (e) => setNewNote(e.target.value),
                            placeholder: "Notatka medyczna...",
                            className: "text-sm",
                            maxLength: 400
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "w-full sm:w-auto flex-1 min-w-[160px] max-w-[160px]", children: [
                        /* @__PURE__ */ jsx("label", { className: "block font-semibold mb-2 text-sm", children: "Data" }),
                        /* @__PURE__ */ jsx(
                          Input,
                          {
                            type: "date",
                            value: newDate,
                            onChange: (e) => setNewDate(e.target.value),
                            className: "text-sm"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsx(
                        Button,
                        {
                          type: "submit",
                          className: "font-semibold px-8 py-2",
                          disabled: !newNote || !newDate,
                          children: "Dodaj notatkę"
                        }
                      )
                    ]
                  }
                )
              ] })
            ] })
          ] })
        }
      )
    }
  );
}
function Checkbox({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    CheckboxPrimitive.Root,
    {
      "data-slot": "checkbox",
      className: cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        CheckboxPrimitive.Indicator,
        {
          "data-slot": "checkbox-indicator",
          className: "flex items-center justify-center text-current transition-none",
          children: /* @__PURE__ */ jsx(CheckIcon, { className: "size-3.5" })
        }
      )
    }
  );
}
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "skeleton",
      className: cn("bg-accent animate-pulse rounded-md", className),
      ...props
    }
  );
}
const ANIMALS_ENDPOINT_PATH = "animals";
const animalsService = {
  async getAnimals(params) {
    try {
      const response = await axios.post(
        `${"http://91.189.217.30:8080/"}${ANIMALS_ENDPOINT_PATH}`,
        params,
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch animals: ${error.message}`);
      }
      throw error;
    }
  }
};
const animalsKeys = {
  all: ["animals"],
  list: (params) => [...animalsKeys.all, "list", params]
};
const useAnimals = (params) => useQuery({
  queryKey: animalsKeys.list(params),
  queryFn: async () => animalsService.getAnimals(params),
  placeholderData: keepPreviousData
});
function AnimalTable({ onGetSelectedIds }) {
  const [pageIndex, setPageIndex] = React__default.useState(0);
  const [pageSize, setPageSize] = React__default.useState(10);
  const { data: animalsPage, isLoading } = useAnimals({
    page: pageIndex,
    pageSize
  });
  console.log("Fetched animals:", animalsPage);
  const [globalFilter, setGlobalFilter] = React__default.useState("");
  const [rowSelection, setRowSelection] = React__default.useState({});
  const [selectedAnimal, setSelectedAnimal] = React__default.useState(
    null
  );
  const [openViewModal, setOpenViewModal] = React__default.useState(false);
  const [openEditModal, setOpenEditModal] = React__default.useState(false);
  const [openMedicalModal, setOpenMedicalModal] = React__default.useState(false);
  const columns = React__default.useMemo(
    () => [
      {
        id: "select",
        header: () => null,
        // No select-all header, single row selection only.
        cell: ({ row }) => /* @__PURE__ */ jsx("div", { className: "h-10 flex items-center justify-center", children: /* @__PURE__ */ jsx(
          Checkbox,
          {
            checked: row.getIsSelected(),
            onCheckedChange: (value) => row.toggleSelected(!!value),
            "aria-label": "Select row",
            onClick: (e) => e.stopPropagation()
          }
        ) }),
        enableSorting: false,
        enableHiding: false
      },
      {
        accessorKey: "id",
        header: "ID",
        cell: (info) => info.row.original.animalId
      },
      {
        accessorKey: "name",
        header: "Imię",
        cell: (info) => /* @__PURE__ */ jsx("a", { href: `/animal/${info.row.original.animalId}`, children: info.getValue() })
      },
      {
        accessorKey: "type",
        header: "Gatunek",
        cell: (info) => info.getValue()
      },
      {
        accessorKey: "breed",
        header: "Rasa",
        cell: (info) => info.getValue()
      },
      {
        accessorKey: "age",
        header: "Wiek",
        cell: (info) => `${info.getValue()} lat`,
        filterFn: "includesString"
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const statusColors = {
            available: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
            adopted: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
            medical: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
          };
          return /* @__PURE__ */ jsx(
            "span",
            {
              className: `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`,
              children: status
            }
          );
        },
        filterFn: "includesString"
      },
      {
        accessorKey: "admissionDate",
        header: "Data przyjęcia",
        cell: (info) => {
          const date = new Date(info.getValue());
          return date.toLocaleDateString();
        },
        filterFn: "includesString"
      },
      // Actions column
      {
        id: "actions",
        header: "Akcje",
        cell: ({ row }) => /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: (e) => {
                e.stopPropagation();
                setSelectedAnimal(row.original);
                setOpenViewModal(true);
              },
              children: [
                /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4 mr-1" }),
                " Podgląd"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "secondary",
              size: "sm",
              onClick: (e) => {
                e.stopPropagation();
                setSelectedAnimal(row.original);
                setOpenEditModal(true);
              },
              children: [
                /* @__PURE__ */ jsx(Pencil, { className: "w-4 h-4 mr-1" }),
                " Edytuj"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "secondary",
              size: "sm",
              onClick: (e) => {
                e.stopPropagation();
                setSelectedAnimal(row.original);
                setOpenMedicalModal(true);
              },
              children: [
                /* @__PURE__ */ jsx(Stethoscope, { className: "w-4 h-4 mr-1" }),
                " Medyczne"
              ]
            }
          )
        ] }),
        enableSorting: false,
        enableHiding: false
      }
    ],
    []
  );
  React__default.useEffect(() => {
    setPageIndex(0);
  }, [globalFilter]);
  const table = useReactTable({
    data: animalsPage?.items || [],
    columns,
    state: {
      globalFilter,
      rowSelection
    },
    enableMultiRowSelection: true,
    onGlobalFilterChange: setGlobalFilter,
    getRowId: (row) => row.id.toString(),
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(animalsPage?.totalCount || 9999)
  });
  const handleGetSelectedIds = () => {
    const selectedRows = table.getState().rowSelection;
    const selectedIds = Object.keys(selectedRows).map((key) => Number(key));
    if (onGetSelectedIds) {
      onGetSelectedIds(selectedIds);
    } else {
      alert(`Selected animal IDs: ${selectedIds.join(", ")}`);
    }
  };
  const selectedCount = Object.keys(table.getState().rowSelection).length;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4 max-w-[1440px] mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between", children: [
      /* @__PURE__ */ jsx(
        Input,
        {
          placeholder: "Szukaj zwierząt...",
          value: globalFilter,
          onChange: (e) => setGlobalFilter(e.target.value),
          className: "max-w-sm md:text-xl h-12"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
        selectedCount > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground mr-2", children: [
            selectedCount,
            " zaznaczono"
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              size: "sm",
              variant: "outline",
              onClick: () => {
                table.resetRowSelection();
              },
              children: "Wyczyść zaznaczenie"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: handleGetSelectedIds,
            disabled: selectedCount === 0,
            variant: selectedCount > 0 ? "default" : "outline",
            children: "Pobierz zaznaczone ID"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-md border", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx("tr", { children: headerGroup.headers.map((header) => /* @__PURE__ */ jsx(
        "th",
        {
          className: "border-b bg-muted/50 px-4 py-3 text-left font-medium text-sm",
          children: header.isPlaceholder ? null : flexRender(
            header.column.columnDef.header,
            header.getContext()
          )
        },
        header.id
      )) }, headerGroup.id)) }),
      /* @__PURE__ */ jsx("tbody", { children: table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx(
        "tr",
        {
          "data-state": row.getIsSelected() && "selected",
          className: "border-b transition-colors hover:bg-muted/50",
          children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx(
            "td",
            {
              className: "px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0",
              children: !isLoading ? flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
              ) : /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-full" })
            },
            cell.id
          ))
        },
        row.id
      )) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: columns.length, className: "h-24 text-center", children: "Brak wyników." }) }) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end space-x-2 py-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx("label", { className: "text-sm", children: "Wierszy na stronę:" }),
      /* @__PURE__ */ jsxs(
        Select$1,
        {
          value: pageSize.toString(),
          onValueChange: (value) => {
            setPageSize(Number(value));
            window.scrollTo({ top: 0, behavior: "instant" });
          },
          children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[80px]", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsx(SelectContent, { children: /* @__PURE__ */ jsxs(SelectGroup, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "10", children: "10" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "20", children: "20" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "50", children: "50" })
            ] }) })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: () => setPageIndex((i) => Math.max(0, i - 1)),
          disabled: pageIndex === 0 || isLoading,
          children: "Poprzednia"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: () => setPageIndex((i) => i + 1),
          disabled: pageSize === animalsPage?.totalCount,
          children: "Następna"
        }
      )
    ] }) }),
    selectedAnimal && /* @__PURE__ */ jsx(
      AnimalViewTab,
      {
        animal: selectedAnimal,
        open: openViewModal && !!selectedAnimal,
        onClose: () => setOpenViewModal(false)
      }
    ),
    selectedAnimal && /* @__PURE__ */ jsx(
      AnimalEditTab,
      {
        animal: selectedAnimal,
        open: openEditModal && !!selectedAnimal,
        onClose: () => setOpenEditModal(false)
      }
    ),
    selectedAnimal && /* @__PURE__ */ jsx(
      AnimalMedicalNotesTab,
      {
        animalId: selectedAnimal.animalId,
        open: openMedicalModal && !!selectedAnimal,
        onClose: () => setOpenMedicalModal(false)
      }
    )
  ] });
}
function LoginPage() {
  const { loginWithRedirect, isLoading } = useAuth0();
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-emerald-100 w-full", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-center justify-center gap-8", children: [
    /* @__PURE__ */ jsx(
      "img",
      {
        src: "./animal-shelter-logo.png",
        alt: "Logo Schroniska dla Zwierząt",
        className: "w-60 h-60 mb-2"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-full", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md w-full p-8 bg-white rounded-md shadow-lg flex flex-col items-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold mb-4 text-emerald-800", children: "Witaj w Panelu Schroniska!" }),
      /* @__PURE__ */ jsx("p", { className: "text-lg mb-8 text-emerald-700", children: "Zaloguj się, aby otrzymać dostęp do systemu schroniska dla zwierząt." }),
      /* @__PURE__ */ jsx(
        Button,
        {
          className: "w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer",
          size: "lg",
          onClick: () => loginWithRedirect({
            authorizationParams: getAuthorizationParams()
          }),
          disabled: isLoading,
          children: "Zaloguj się"
        }
      )
    ] }) })
  ] }) });
}
function Header({ shelterName }) {
  const { logout, isLoading, error, isAuthenticated, loginWithRedirect } = useAuth0();
  if (error) {
    return /* @__PURE__ */ jsxs("div", { children: [
      "Error: ",
      error.message
    ] });
  }
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("header", { className: "p-4 flex items-center bg-emerald-800 text-white shadow-md", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1440px] mx-auto flex items-center w-full", children: [
    /* @__PURE__ */ jsx("h1", { className: "ml-4 text-xl font-semibold", children: /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex gap-2 items-center", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: "./animal-shelter-logo.png",
          alt: "Schronisko dla zwierząt",
          className: "h-10"
        }
      ),
      shelterName ? `Panel ${shelterName}` : "Panel Schroniska"
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "ml-auto space-x-4 flex items-center justify-center min-w-[100px]", children: isLoading ? /* @__PURE__ */ jsxs(
      "svg",
      {
        className: "w-5 h-5 animate-spin text-white",
        viewBox: "0 0 24 24",
        children: [
          /* @__PURE__ */ jsx(
            "circle",
            {
              className: "opacity-25",
              cx: "12",
              cy: "12",
              r: "10",
              stroke: "currentColor",
              strokeWidth: "4",
              fill: "none"
            }
          ),
          /* @__PURE__ */ jsx(
            "path",
            {
              className: "opacity-75",
              fill: "currentColor",
              d: "M4 12a8 8 0 018-8V0C4.477 0 0 4.477 0 12h4z"
            }
          )
        ]
      }
    ) : isAuthenticated ? /* @__PURE__ */ jsx(
      Button,
      {
        variant: "secondary",
        className: "cursor-pointer",
        onClick: () => {
          logout({
            logoutParams: { returnTo: getOriginHomePage() || "" }
          });
        },
        children: "Wyloguj się"
      }
    ) : /* @__PURE__ */ jsx(
      Button,
      {
        onClick: () => loginWithRedirect({
          authorizationParams: getAuthorizationParams()
        }),
        children: "Zaloguj się"
      }
    ) })
  ] }) }) });
}
function useUserInfo({
  setIsLoginModalOpen,
  setRoles
}) {
  const [shelterName, setShelterName] = useState(null);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  useEffect(() => {
    if (!isAuthenticated) {
      setShelterName(null);
      return;
    }
    (async () => {
      try {
        setIsLoadingRoles(true);
        const token = await getAccessTokenSilently({
          authorizationParams: getAuthorizationParams()
        });
        setShelterName(getShelterName(decodeJwt(token || "")));
        const roles = getRoles(decodeJwt(token || ""));
        setRoles(roles);
        setIsLoadingRoles(false);
      } catch (e) {
        setIsLoadingRoles(false);
        if (e instanceof Error) {
          if (e.message.includes("Missing Refresh Token")) {
            setIsLoginModalOpen(true);
          }
        } else {
          console.error("Unexpected error:", e);
        }
      }
    })();
  }, [getAccessTokenSilently, isAuthenticated]);
  return { shelterName, isLoadingRoles };
}
function LoginModal({
  open,
  onOpenChange,
  onClick,
  loading
}) {
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-xs", showCloseButton: true, children: [
    /* @__PURE__ */ jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsx(DialogTitle, { className: "text-emerald-800", children: "Witaj w Panelu Schroniska!" }),
      /* @__PURE__ */ jsx(DialogDescription, { className: "text-emerald-700 mb-4", children: "Zaloguj się, aby otrzymać dostęp do systemu schroniska dla zwierząt." })
    ] }),
    /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(
      Button,
      {
        className: "w-full bg-emerald-600 hover:bg-emerald-700 text-white",
        size: "lg",
        onClick,
        disabled: loading,
        children: "Zaloguj się"
      }
    ) })
  ] }) });
}
function NoAccess() {
  const { isLoading, logout } = useAuth0();
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-emerald-100 w-full", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-center justify-center gap-8", children: [
    /* @__PURE__ */ jsx(
      "img",
      {
        src: "./animal-shelter-logo.png",
        alt: "Logo Schroniska dla Zwierząt",
        className: "w-60 h-60 mb-2"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-full", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md w-full p-8 bg-white rounded-md shadow-lg flex flex-col items-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold mb-4 text-red-700", children: "Nie masz przypisanej roli" }),
      /* @__PURE__ */ jsx("p", { className: "text-lg mb-4 text-gray-700 text-center", children: "Twoje konto nie posiada jeszcze przypisanej roli. To typowa sytuacja zaraz po założeniu nowego konta. Musisz poczekać, aż administrator nada Ci odpowiednią rolę." }),
      /* @__PURE__ */ jsx("p", { className: "text-md mb-8 text-gray-600 text-center", children: "Możesz spróbować zalogować się ponownie później, gdy uzyskasz dostęp." }),
      /* @__PURE__ */ jsx(
        Button,
        {
          className: "w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer",
          size: "lg",
          onClick: () => {
            logout();
          },
          disabled: isLoading,
          children: "Przejdź do strony logowania"
        }
      )
    ] }) })
  ] }) });
}
function App() {
  const {
    isAuthenticated,
    getAccessTokenWithPopup,
    isLoading
  } = useAuth0();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const handleGetSelectedIds = (ids) => {
    alert(`Ready to send ${ids.length} animal IDs to API: ${ids.join(", ")}`);
  };
  const {
    shelterName,
    isLoadingRoles
  } = useUserInfo({
    setIsLoginModalOpen,
    setRoles
  });
  const userHasNoRoles = !isLoadingRoles && roles.length === 0;
  return /* @__PURE__ */ jsxs("div", { className: "", children: [
    !isAuthenticated ? /* @__PURE__ */ jsx(LoginPage, {}) : userHasNoRoles ? /* @__PURE__ */ jsx(NoAccess, {}) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-16", children: [
      /* @__PURE__ */ jsx(Header, { shelterName }),
      /* @__PURE__ */ jsx("div", { className: "container mx-auto", children: /* @__PURE__ */ jsx(AnimalTable, { onGetSelectedIds: handleGetSelectedIds }) })
    ] }),
    /* @__PURE__ */ jsx(LoginModal, { open: isLoginModalOpen, onOpenChange: setIsLoginModalOpen, onClick: () => {
      getAccessTokenWithPopup({
        authorizationParams: getAuthorizationParams()
      }).then(() => setIsLoginModalOpen(false));
    }, loading: isLoading })
  ] });
}
export {
  App as component
};
