export function Logo({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/icon-512.png"
      alt="Ananke logo"
      width={size}
      height={size}
      className="rounded-lg"
    />
  )
}