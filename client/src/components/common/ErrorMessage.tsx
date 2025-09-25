export default function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null
  return <div className="small error" role="alert" style={{ marginTop: 8 }}>{message}</div>
}
