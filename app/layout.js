export const metadata = {
  title: 'Car in the Sky',
  description: 'A serene 3D scene of a flying car soaring through the sky.'
};

import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
