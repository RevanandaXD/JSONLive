import Link from "next/link";
import Image from "next/image";

type LogoProps = {
  href?: string;
  className?: string;
  imageSize?: number;
};

export const Logo = ({
  href = "/",
  className = "",
  imageSize = 26,
}: LogoProps) => {
  const mark = (
    <Image
      src="/logo.svg"
      alt="JSONLive"
      width={imageSize}
      height={imageSize}
      className="shrink-0 rounded-md"
      unoptimized
    />
  );

  const text = <span>JSONLive</span>;

  const classes = `flex items-center gap-2 font-heading font-bold tracking-tight text-foreground ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {mark}
        {text}
      </Link>
    );
  }

  return (
    <div className={classes}>
      {mark}
      {text}
    </div>
  );
};