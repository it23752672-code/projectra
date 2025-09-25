export default function Loader({ size = 24 }: { size?: number }) {
  return <div className="loader" style={{ width: size, height: size }} />
}
