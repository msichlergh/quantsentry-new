import Image from "next/image";

export function BrandLockup() {
  return (
    <>
      <Image
        className="brand-icon-concept brand-icon-mark"
        src="/images/quantsentry-icon-teal-cluster.png"
        width={469}
        height={469}
        alt=""
        priority
      />
      <span className="brand-wordmark brand-wordmark-dm-sans">
        <span className="brand-wordmark-quant">Quant</span>
        <span className="brand-wordmark-sentry">Sentry</span>
      </span>
    </>
  );
}
