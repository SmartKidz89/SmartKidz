"use client";

import { useRive } from "@rive-app/react-canvas";

export default function RiveMascot({ url, className = "" }) {
  const { RiveComponent } = useRive({
    src: url,
    autoplay: true,
  });

  return (
    <div className={className} style={{ width: 80, height: 80 }}>
      <RiveComponent />
    </div>
  );
}
