import { InvestorNote } from '@/types/analysis';
import { AlertTriangle, Info, XOctagon } from 'lucide-react';

interface Props { note: InvestorNote; }

const styles = {
  critical: {
    wrapper: 'bg-red-500/10 border-red-500/40',
    icon: XOctagon,
    iconColor: 'text-red-400',
    titleColor: 'text-red-300',
    textColor: 'text-red-200/70',
  },
  warning: {
    wrapper: 'bg-yellow-500/10 border-yellow-500/30',
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
    titleColor: 'text-yellow-300',
    textColor: 'text-yellow-200/70',
  },
  info: {
    wrapper: 'bg-slate-800 border-slate-700',
    icon: Info,
    iconColor: 'text-blue-400',
    titleColor: 'text-slate-200',
    textColor: 'text-slate-400',
  },
};

export default function InvestorNoteCard({ note }: Props) {
  const s = styles[note.priority];
  const Icon = s.icon;
  return (
    <div className={`border rounded-xl p-4 ${s.wrapper}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${s.iconColor}`} />
        <div>
          <p className={`font-semibold text-sm ${s.titleColor}`}>{note.title}</p>
          <p className={`text-xs mt-1 leading-relaxed ${s.textColor}`}>{note.description}</p>
          {note.action_required && (
            <span className="inline-block mt-2 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Aksiyon gerekli</span>
          )}
        </div>
      </div>
    </div>
  );
}
