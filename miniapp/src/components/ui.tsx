import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "success" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-gradient-to-r from-max-500 to-max-600 text-white shadow-soft",
  secondary: "bg-max-50 text-max-600 hover:bg-max-100",
  success: "bg-success-500 text-white",
  danger: "bg-red-50 text-error-500 hover:bg-red-100",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:bg-none disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:active:scale-100 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({ label, icon, htmlFor, children }: { label: ReactNode; icon?: ReactNode; htmlFor?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5 px-1">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-max-300";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} resize-none ${props.className ?? ""}`} />;
}

export function Card({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`block w-full text-left bg-white rounded-2xl border border-slate-100 shadow-card ${onClick ? "active:scale-[0.98] transition-transform" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
