import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import VerificationRequired from "./VerificationRequired";
import FirstTimeUpload from "./FirstTimeUpload";

interface VerificationGuardProps {
  children: React.ReactNode;
}

export default function VerificationGuard({ children }: VerificationGuardProps) {
  const [location, setLocation] = useLocation();

  // Check verification status
  const { data: verificationStatus, isLoading } = useQuery<{
    isVerified: boolean;
    verifiedCount: number;
    requiredCount: number;
    hasPending: boolean;
    hasDocuments?: boolean;
    totalDocuments?: number;
  }>({
    queryKey: ["/api/documents/verification-status"],
    refetchInterval: 10000, // Refetch every 10 seconds to catch admin document changes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0, // Always consider stale to get latest status
  });

  // Allow access to documents page without verification
  const isDocumentsPage = location === "/dashboard/documents";

  // Redirect to documents if not verified and not already on documents page
  // BUT only if user has already uploaded at least one document
  useEffect(() => {
    if (
      !isLoading && 
      verificationStatus && 
      !verificationStatus.isVerified && 
      !isDocumentsPage &&
      verificationStatus.hasDocuments
    ) {
      setLocation("/dashboard/documents");
    }
  }, [verificationStatus, isLoading, isDocumentsPage, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Allow access to documents page
  if (isDocumentsPage) {
    return <>{children}</>;
  }

  // Show first-time upload page if user has NO documents uploaded yet
  if (verificationStatus && !verificationStatus.hasDocuments && !verificationStatus.isVerified) {
    return <FirstTimeUpload />;
  }

  // Block access to other pages if not verified (but has documents)
  if (verificationStatus && !verificationStatus.isVerified && verificationStatus.hasDocuments) {
    return (
      <VerificationRequired
        verifiedCount={verificationStatus.verifiedCount}
        requiredCount={verificationStatus.requiredCount}
        hasPending={verificationStatus.hasPending}
      />
    );
  }

  // Allow access if verified
  return <>{children}</>;
}

