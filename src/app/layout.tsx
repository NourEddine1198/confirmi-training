export const metadata = {
  title: "Confirmi Training",
  description: "Agent training platform for order confirmation & status",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
