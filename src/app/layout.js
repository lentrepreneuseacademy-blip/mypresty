import './globals.css';

export const metadata = {
  title: 'MY PRESTY — Le logiciel de réservation beauté qui remplace tous les autres',
  description: "MY PRESTY : agenda, caisse, fidélité, IA prédictive, avis automatiques, QR code, rappels intelligents. L'outil tout-en-un pour salons de beauté. Essai gratuit 90 jours.",
  openGraph: {
    title: 'MY PRESTY — Le logiciel de réservation beauté intelligent',
    description: 'Agenda, caisse, fidélité, IA prédictive. Tout-en-un pour votre salon. Essai gratuit 90 jours.',
    type: 'website',
  },
  themeColor: '#1A1A1A',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
