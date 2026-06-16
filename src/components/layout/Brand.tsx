import Image from "next/image";
import Link from "next/link";

type BrandProps = {
  compact?: boolean;
  href?: string;
};

export function Brand({ compact = false, href }: BrandProps) {
  const content = (
    <>
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
    </>
  );

  if (href) {
    return (
      <Link href={href} className="flex w-fit items-center gap-3 rounded-sm focus:outline-none focus:ring-4 focus:ring-rpx-blue/20">
        {content}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {content}
    </div>
  );
}
