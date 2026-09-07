export default function TrustBadges() {
  return (
    <div className="relative" style={{ background: "#FCF4E7" }}>
      <div className="flex items-center justify-between px-4 py-4">
        <Badge
          label={<>Easy returns<br />&amp; refunds</>}
          icon={<ReturnIcon />}
        />
        <Divider />
        <Badge label={<>Cash on<br />delivery</>} icon={<CodIcon />} />
        <Divider />
        <Badge label={<>Lowest<br />price</>} icon={<PriceIcon />} />
      </div>
      <span className="absolute right-2 bottom-1 text-[8px] text-[#c9a86a]">*T&amp;C apply</span>
    </div>
  );
}

function Badge({ label, icon }: { label: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 flex-1 justify-center">
      <span className="shrink-0">{icon}</span>
      <span className="text-[13px] font-semibold leading-tight" style={{ color: "var(--brand-dark)" }}>
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return <span className="w-px h-8 bg-[#eaddc6]" />;
}

function ReturnIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" fill="#F4E4D0" />
      <path
        d="M11 12a7 7 0 1 1-1.2 4"
        stroke="var(--brand)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M8 8v4h4" stroke="var(--brand)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 15.5h3v4h-3z" fill="#F4A93B" />
    </svg>
  );
}

function CodIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
      <rect x="6" y="11" width="20" height="12" rx="2" fill="#F4A93B" />
      <circle cx="16" cy="17" r="3" fill="#fff" />
      <path d="M6 24c2 2 6 3 10 3s8-1 10-3" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <text x="16" y="19" fontSize="4.5" fontWeight="bold" textAnchor="middle" fill="var(--brand-dark)">₹</text>
    </svg>
  );
}

function PriceIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#F1E1EC" />
      <text x="13" y="21" fontSize="14" fontWeight="bold" fill="var(--brand)">₹</text>
      <path d="M22 12v8m0 0l-3-3m3 3l3-3" stroke="#F4A93B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
