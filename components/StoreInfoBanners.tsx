const storeDetails = [
  {
    title: "Free shipping",
    detail: "Standard delivery across India",
    icon: (
      <>
        <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
        <circle cx="7.5" cy="18" r="1.5" />
        <circle cx="17.5" cy="18" r="1.5" />
      </>
    ),
  },
  {
    title: "Delivery estimate",
    detail: "Usually 7–10 days",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
  {
    title: "COD available",
    detail: "₹100 advance adjusts to your total",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18m-13 5h4" />
      </>
    ),
  },
  {
    title: "Easy returns",
    detail: "Eligible items within 7 days",
    icon: (
      <>
        <path d="M3 11a9 9 0 0 1 15.4-6.4L21 7" />
        <path d="M21 3v4h-4M21 13a9 9 0 0 1-15.4 6.4L3 17" />
        <path d="M3 21v-4h4" />
      </>
    ),
  },
];

export default function StoreInfoBanners() {
  return (
    <section aria-label="Shipping, payment and return information" className="px-3 py-3">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2">
        {storeDetails.map((detail) => (
          <div
            key={detail.title}
            className="group flex min-h-[76px] items-center gap-2.5 rounded-2xl border border-[#ead5e5] bg-gradient-to-r from-white via-[#fcf5fa] to-[#f8eaf4] px-2.5 py-2.5 shadow-[0_3px_10px_rgba(87,11,71,0.045)] transition-shadow hover:shadow-[0_6px_16px_rgba(87,11,71,0.1)]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f8eaf4] text-[#9f2089]">
              <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                {detail.icon}
              </svg>
            </span>
            <span className="min-w-0">
              <h2 className="text-[12px] font-extrabold leading-tight text-[#353543]">{detail.title}</h2>
              <p className="mt-1 text-[10px] leading-[1.35] text-[#696977]">{detail.detail}</p>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
