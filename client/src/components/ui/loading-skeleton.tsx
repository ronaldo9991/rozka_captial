import { Skeleton } from "@/components/ui/skeleton";

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header Skeleton */}
      <div className="border-b border-[#D4AF37]/20 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Skeleton className="h-8 w-32 bg-[#D4AF37]/10" />
            <div className="flex gap-6">
              <Skeleton className="h-4 w-16 bg-[#D4AF37]/10" />
              <Skeleton className="h-4 w-16 bg-[#D4AF37]/10" />
              <Skeleton className="h-4 w-16 bg-[#D4AF37]/10" />
              <Skeleton className="h-4 w-16 bg-[#D4AF37]/10" />
            </div>
            <Skeleton className="h-10 w-24 bg-[#D4AF37]/10" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          <Skeleton className="h-12 w-3/4 bg-[#D4AF37]/10" />
          <Skeleton className="h-6 w-1/2 bg-[#D4AF37]/10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Skeleton className="h-48 bg-[#D4AF37]/10" />
            <Skeleton className="h-48 bg-[#D4AF37]/10" />
            <Skeleton className="h-48 bg-[#D4AF37]/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar Skeleton */}
      <div className="w-64 border-r border-[#D4AF37]/20 p-6">
        <Skeleton className="h-8 w-32 mb-8 bg-[#D4AF37]/10" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full bg-[#D4AF37]/10" />
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 p-8">
        <Skeleton className="h-10 w-48 mb-6 bg-[#D4AF37]/10" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-[#D4AF37]/10" />
          ))}
        </div>
        <Skeleton className="h-96 bg-[#D4AF37]/10" />
      </div>
    </div>
  );
}

export function FormLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Skeleton className="h-12 w-3/4 mx-auto bg-[#D4AF37]/10" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full bg-[#D4AF37]/10" />
          <Skeleton className="h-12 w-full bg-[#D4AF37]/10" />
          <Skeleton className="h-12 w-full bg-[#D4AF37]/10" />
          <Skeleton className="h-12 w-full bg-[#D4AF37]/10" />
        </div>
      </div>
    </div>
  );
}

