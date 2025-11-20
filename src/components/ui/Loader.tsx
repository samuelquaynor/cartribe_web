"use client";

type LoaderProps = {
  message?: string;
  fullscreen?: boolean;
  className?: string;
};

export default function Loader({ message = "Loading...", fullscreen = false, className = "" }: LoaderProps) {
  const containerClasses = fullscreen
    ? "min-h-screen flex items-center justify-center"
    : "flex items-center justify-center py-8";

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

