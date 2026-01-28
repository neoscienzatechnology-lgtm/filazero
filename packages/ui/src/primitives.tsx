import * as React from "react";

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      className={
        "rounded-lg bg-black px-4 py-2 text-white hover:bg-neutral-800 disabled:opacity-50 " +
        className
      }
      {...rest}
    />
  );
}

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return (
    <div
      className={
        "rounded-xl border border-neutral-200 bg-white p-4 shadow-sm " + className
      }
      {...rest}
    />
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      className={
        "w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-black " +
        className
      }
      {...rest}
    />
  );
}

