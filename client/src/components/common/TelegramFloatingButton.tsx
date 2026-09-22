import React from 'react';
import { TelegramIcon } from './TelegramIcon';

export const TelegramFloatingButton: React.FC = () => {
  return (
    <aside aria-label="Support contacts" className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
      <a
        href="https://t.me/Desi_infinity_studio"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#229ED9] to-[#0088cc] hover:from-[#1e8bc0] hover:to-[#0077b5] text-white font-bold text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 active:scale-95 border border-white/20"
        title="Contact on Telegram @Desi_infinity_studio"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <TelegramIcon className="w-4 h-4 text-white" />
        </div>
        <span className="hidden sm:inline">Contact Support</span>
        <span className="text-[11px] opacity-90 font-mono font-normal">@Desi_infinity_studio</span>
      </a>
    </aside>
  );
};
