import React from 'react';

// FIX: Changed from interface to type with intersection to fix type inference for rest props.
type InputFieldProps = {
  label: string;
  id: string;
  type?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>;

export default function InputField({ label, id, type = 'text', error, ...props }: InputFieldProps) {
  const commonClasses = "w-full font-sans bg-creme-velado dark:bg-verde-escuro-profundo border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-lg p-3 text-marrom-seiva dark:text-creme-velado focus:outline-none focus:ring-2 focus:ring-dourado-suave focus:border-dourado-suave transition-colors placeholder:text-[#7A6C59] dark:placeholder:text-creme-velado/60";
  
  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div>
      <label htmlFor={id} className="block font-sans font-semibold text-sm mb-2 text-marrom-seiva dark:text-creme-velado/80">
        {label}
      </label>
      <InputComponent
        id={id}
        type={type}
        className={commonClasses}
        rows={type === 'textarea' ? 4 : undefined}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}