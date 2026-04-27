import CustomCursor from "@/components/public/CustomCursor";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomCursor />
      {children}
    </>
  );
}
