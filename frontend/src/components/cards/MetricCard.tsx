interface Props {
  label: string;
  value: string | number;
  variant?: 'default' | 'primary' | 'positive' | 'negative';
  subtext?: string;
}

const variantStyles = {
  default: 'bg-slate-800 border-slate-700 text-slate-200',
  primary: 'bg-blue-600/20 border-blue-500/40 text-blue-300',
  positive: 'bg-green-500/10 border-green-500/30 text-green-400',
  negative: 'bg-red-500/10 border-red-500/30 text-red-400',
};

export default function MetricCard({ label, value, variant = 'default', subtext }: Props) {
  return (
    <div className={`border rounded-xl p-4 ${variantStyles[variant]}`}>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-xl font-bold ${variantStyles[variant].split(' ').pop()}`}>{value}</div>
      {subtext && <div className="text-xs text-slate-500 mt-1">{subtext}</div>}
    </div>
  );
}
