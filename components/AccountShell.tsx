export default function AccountShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="shop-ambient-bg" aria-hidden="true" />
      {children}
    </>
  );
}
