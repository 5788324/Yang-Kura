import type { Mvp73PlayerDailyVisualFocusModel } from '../../services/playerDailyVisualFocusService';
import { playerDailyVisualFocusService } from '../../services/playerDailyVisualFocusService';

interface PlayerFocusSummaryProps {
  isInactive: boolean;
  model: Mvp73PlayerDailyVisualFocusModel;
}

/**
 * Pure presentation for the current full-player focus summary.
 * The parent computes the model; this component only renders it.
 */
export default function PlayerFocusSummary({ isInactive, model }: PlayerFocusSummaryProps) {
  return (
    <div
      id="mvp73-player-daily-visual-focus"
      className={`relative z-10 mx-4 hidden rounded-[28px] border border-white/10 bg-gradient-to-r from-white/[0.075] via-white/[0.035] to-sky-500/[0.055] px-4 py-3 backdrop-blur-2xl shadow-2xl shadow-sky-950/25 transition-all duration-700 sm:block lg:mx-16 lg:px-5 lg:py-4 ${
        isInactive ? 'opacity-0 pointer-events-none -translate-y-3' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-sky-200">
              {model.eyebrow}
            </span>
            <span className="text-[10px] font-semibold text-zinc-500">{model.modeLabel}</span>
          </div>
          <h3 className="mt-2 truncate text-xl font-black tracking-tight text-white lg:text-2xl">
            {model.title}
          </h3>
          <p className="mt-1 truncate text-sm text-zinc-300">{model.subtitle}</p>
          <p className="mt-2 truncate text-[12px] text-zinc-500">{model.focusLine}</p>
        </div>

        <div className="flex min-w-0 flex-col gap-3 xl:min-w-[560px]">
          <div className="flex flex-wrap gap-2">
            {model.chips.map((chip) => (
              <span
                key={`${chip.label}-${chip.tone}`}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${playerDailyVisualFocusService.getChipClass(chip.tone)}`}
              >
                {chip.label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {model.cards.map((card) => (
              <div
                key={`${card.title}-${card.tone}`}
                className="rounded-2xl border border-white/10 bg-zinc-950/35 px-3 py-2.5"
              >
                <p className="text-[11px] font-extrabold text-white">{card.title}</p>
                <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-zinc-400">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
