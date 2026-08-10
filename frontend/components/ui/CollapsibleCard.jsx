'use client';

export function MainCard({ title, isOpen, onToggle, children }) {
  return (
    <div className="bg-white rounded-xl border border-valuon-border shadow-sm overflow-hidden">
      <div
        onClick={onToggle}
        className="p-5 flex items-center gap-2 cursor-pointer select-none bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="text-[0.75rem] text-valuon-green w-3 text-center">
          {isOpen ? '▼' : '►'}
        </span>
        <h4 className="m-0 text-base font-extrabold text-valuon-green">
          {title}
        </h4>
      </div>

      {isOpen && (
        <div className="px-5 pb-5 flex flex-col gap-4">
          {children}
        </div>
      )}
    </div>
  );
}

export function SubContainerCard({ title, isOpen, onToggle, children }) {
  return (
    <div className="bg-valuon-cream border border-valuon-border rounded-lg overflow-hidden">
      <div
        onClick={onToggle}
        className="py-3 px-3.5 flex justify-between items-center cursor-pointer select-none font-extrabold text-[0.85rem] text-valuon-green hover:bg-white/50 transition-colors"
      >
        <span>{title}</span>
        <span className="text-[0.75rem] text-slate-500">
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {isOpen && (
        <div className="p-3.5 pt-4 flex flex-col gap-4 border-t border-valuon-border">
          {children}
        </div>
      )}
    </div>
  );
}
