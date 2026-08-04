export const metadata = {
  title: 'Valuon Estate',
  description: 'Institutional Grade Investment Suite',
}

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body style={{ margin: 0, padding: 0, background: '#F7F4EC', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
