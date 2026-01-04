interface Success {
  success?: boolean,
  message?: string,
}
export default function Success({ success, message }: SuccessProps) {
  if (!success) {
    return null;
  }
  return (
    <div className="bg-green-300 border-3 p-[0.5rem] rounded">
      <p>{message}</p>
    </div>
  )
}
