import './globals.css';

export const metadata = {
  title: 'MY PRESTY — Logiciel de réservation beauté',
  description: 'Le logiciel de réservation en ligne pour les professionnels de la beauté. 19€/mois, tout illimité.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
