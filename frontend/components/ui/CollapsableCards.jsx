'use client';

export function MainCard({ title, isOpen, onToggle, children }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #E2D9CE',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      overflow: 'hidden'
    }}>
      <div
        onClick={onToggle}
        style={{
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          userSelect: 'none',
          background: 'white'
        }}
      >
        <span style={{ fontSize: '0.75rem', color: '#13381A' }}>
          {isOpen ? '▼' : '►'}
        </span>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#13381A' }}>
          {title}
        </h4>
      </div>

      {isOpen && (
        <div style={{
          padding: '0 1.25rem 1.25rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function SubContainerCard({ title, isOpen, onToggle, children }) {
  return (
    <div style={{
      background: '#FAF8F5',
      border: '1px solid #E2D9CE',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <div
        onClick={onToggle}
        style={{
          padding: '12px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          fontWeight: '800',
          fontSize: '0.85rem',
          color: '#13381A'
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: '0.75rem', color: '#718096' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {isOpen && (
        <div style={{
          padding: '12px 14px 14px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          borderTop: '1px solid #E2D9CE'
        }}>
          {children}
        </div>
      )}
    </div>
  );
}
