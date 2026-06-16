import Image from "next/image";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/logo-global-rpx-horizontal.png"
        alt="Global RPX"
        width={540}
        height={210}
        priority
        className="h-14 w-auto max-w-[190px]"
      />
      {!compact ? (
        <div>
          <p className="sr-only">Global RPX</p>
        </div>
      ) : null}
    </div>
  );
}
