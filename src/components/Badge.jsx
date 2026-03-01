const variants = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  red: 'bg-rose-50 text-rose-700 border-rose-200/60',
  blue: 'bg-sky-50 text-sky-700 border-sky-200/60',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200/60',
  gray: 'bg-slate-50 text-slate-600 border-slate-200/60',
  purple: 'bg-violet-50 text-violet-700 border-violet-200/60',
}

export default function Badge({ children, variant = 'gray' }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border tracking-wide ${variants[variant]}`}>
      {children}
    </span>
  )
}
