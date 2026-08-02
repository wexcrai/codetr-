'use client';

import { Printer, Download } from 'lucide-react';

export function CertificateClient() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs hover:opacity-90 transition-all shadow-lg shadow-amber-500/20"
      >
        <Printer className="w-4 h-4" /> Sertifikayı Yazdır / PDF İndir
      </button>
    </div>
  );
}
