import type React from "react";
import { DefaultOGTemplate, OGTemplate } from "./og-template";

export function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <header>
        <h1 className="font-medium text-base text-neutral-950 dark:text-neutral-50">
          {title}
        </h1>
        <p className="mt-1 max-w-[56ch] text-pretty text-base text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      </header>
      {children ? (
        <OGTemplate>{children}</OGTemplate>
      ) : (
        <DefaultOGTemplate description={description} title={title} />
      )}
    </>
  );
}
