import { Search, Plus, ClipboardList, User } from "lucide-react";

interface MainMenuProps {
  onSelect: (action: string) => void;
}

const items = [
  { id: "find", label: "Найти встречу", icon: Search, gradient: "from-blue-500 to-cyan-500" },
  { id: "create", label: "Создать встречу", icon: Plus, gradient: "from-max-500 to-max-600" },
  { id: "my", label: "Мои встречи", icon: ClipboardList, gradient: "from-emerald-500 to-teal-500" },
  { id: "profile", label: "Мой профиль", icon: User, gradient: "from-amber-500 to-orange-500" },
];

export function MainMenu({ onSelect }: MainMenuProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 animate-pop-in">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="flex flex-col items-center gap-2 p-3.5 bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200 active:scale-95 group"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-semibold text-slate-700">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
