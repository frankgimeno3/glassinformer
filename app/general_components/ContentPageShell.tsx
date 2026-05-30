import { FC, ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Tailwind max-width on the inner column (default matches company / product profiles). */
  maxWidthClass?: string;
};

/** Gray page background + centered white card (aligned with central panel company create). */
const ContentPageShell: FC<Props> = ({ children, maxWidthClass = "max-w-4xl" }) => (
  <div className="min-h-screen bg-gray-50 py-8 flex justify-center px-4 sm:px-6 lg:px-8">
    <div className={`w-full ${maxWidthClass}`}>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-6 md:p-10">
        {children}
      </div>
    </div>
  </div>
);

export default ContentPageShell;
