import type { ReactNode } from "react";

type GridTileProps = { label: string; children: ReactNode };

// One participant tile in the group call grid, labelled with their name
export const GridTile = ({ label, children }: GridTileProps) => (
  <div className="relative flex aspect-3/4 items-center justify-center overflow-hidden rounded-xl bg-[#1f2c34] sm:aspect-video">
    {children}
    <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px]">{label}</span>
  </div>
);
