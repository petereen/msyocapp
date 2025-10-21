export function Input({ className = '', ...props }) {
  return <input className={"w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300 " + className} {...props} />
}
