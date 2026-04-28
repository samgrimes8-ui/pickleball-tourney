import "./globals.css";
import { TournamentProvider } from "@/lib/TournamentContext";

export const metadata = {
  title: "Pickleball Team Building '26",
  description: "Tournament HQ — brackets, scores, and chaos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="paper min-h-screen">
        <TournamentProvider>{children}</TournamentProvider>
      </body>
    </html>
  );
}
