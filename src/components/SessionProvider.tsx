// This component is kept for compatibility but no longer provides authentication
// Authentication is now handled via JWT tokens and API calls
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
