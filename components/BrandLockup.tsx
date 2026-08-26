import Image from "next/image";

export function BrandLockup() {
  return (
    <>
      <Image
        className="brand-icon-concept brand-icon-coil"
        src="/images/quantsentry-icon-teal-coil-v2.png"
        width={159}
        height={158}
        alt=""
        priority
      />
      <span className="brand-wordmark brand-wordmark-instrument-sans">
        <span className="brand-wordmark-quant">Quant</span>
        <span className="brand-wordmark-sentry">Sentry</span>
      </span>
    </>
  );
}
