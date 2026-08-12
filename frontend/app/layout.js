import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Valuon Estate',
  description: 'Institutional Grade Investment Suite',
}

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      {/* overflow-y-scroll erzwingt die Scrollbar dauerhaft, wodurch das "Wackeln" der Navbar verschwindet */}
      <body className="m-0 p-0 bg-valuon-bg text-valuon-green font-sans min-h-screen overflow-y-scroll">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
