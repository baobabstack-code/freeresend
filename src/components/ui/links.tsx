"use client";

import { forwardRef } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Link,
  type ButtonProps,
  type LinkProps,
} from "@fluentui/react-components";

// Fluent's Button/Link props are a union of button|anchor shapes; render them as anchors here.
const AnchorButton = Button as unknown as React.ComponentType<Record<string, unknown>>;
const AnchorLink = Link as unknown as React.ComponentType<Record<string, unknown>>;

function isInternal(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

function useClientNav(href: string, target?: string) {
  const router = useRouter();
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      !isInternal(href) ||
      target === "_blank" ||
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }
    e.preventDefault();
    router.push(href);
  };
}

type LinkButtonProps = Omit<ButtonProps, "as" | "href"> & {
  href: string;
  target?: string;
  rel?: string;
  "data-testid"?: string;
};

/** A Fluent Button rendered as a link, with client-side navigation for internal hrefs. */
export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(function LinkButton(
  { href, target, rel, onClick, ...props },
  ref
) {
  const nav = useClientNav(href, target);
  const external = !isInternal(href);
  return (
    <AnchorButton
      {...props}
      as="a"
      href={href}
      target={target}
      rel={rel ?? (external && target === "_blank" ? "noopener noreferrer" : undefined)}
      ref={ref}
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        (onClick as ((e: React.MouseEvent<HTMLAnchorElement>) => void) | undefined)?.(e);
        nav(e);
      }}
    />
  );
});

type AppLinkProps = Omit<LinkProps, "href"> & { href: string; target?: string; rel?: string };

/** A Fluent Link with client-side navigation for internal hrefs. */
export function AppLink({ href, target, rel, onClick, ...props }: AppLinkProps) {
  const nav = useClientNav(href, target);
  const external = !isInternal(href);
  return (
    <AnchorLink
      {...props}
      href={href}
      target={target}
      rel={rel ?? (external && target === "_blank" ? "noopener noreferrer" : undefined)}
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        (onClick as ((e: React.MouseEvent<HTMLAnchorElement>) => void) | undefined)?.(e);
        nav(e);
      }}
    />
  );
}
