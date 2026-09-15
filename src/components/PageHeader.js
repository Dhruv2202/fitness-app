import ThemeToggle from "@/components/ThemeToggle";

export default function PageHeader({ title, subtitle }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      <ThemeToggle />
    </div>
  );
}
