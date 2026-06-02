import { Container } from "@/components/ui/container";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
      <div className="w-full max-w-md">{children}</div>
    </Container>
  );
}
