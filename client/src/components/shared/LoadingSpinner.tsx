export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${sizeClasses[size]} border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin`}
    />
  );
}
