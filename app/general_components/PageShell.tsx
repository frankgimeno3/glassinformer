import { FC, ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Tailwind max-width on the shell itself. */
  maxWidthClass?: string;
  /** Tailwind min-height on the shell itself. */
  minHeightClass?: string;
  /** Tailwind padding on the shell itself. */
  paddingClass?: string;
};

/**
 * White, centered shell with padding.
 * Intentionally avoids nested "content container" + "card" wrappers.
 */
const PageShell: FC<Props> = ({
  children,
  maxWidthClass = "max-w-4xl",
  minHeightClass = "min-h-[50vh]",
  paddingClass = "p-6 md:p-10",
}) => (
  <div className={`mx-auto w-full ${maxWidthClass} bg-white ${paddingClass} ${minHeightClass}`}>
    {children}
  </div>
);

export default PageShell;

