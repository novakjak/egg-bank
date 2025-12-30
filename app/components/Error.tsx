interface ErrorProps {
  error?: boolean,
  message?: string,
}
export default function Error({ error, message }: ErrorProps) {
  if (!error) {
    return null;
  }
  return (
    <div className="bg-red-300 border-3 p-[0.5rem] rounded">
      <p>An error occured: {message}</p>
    </div>
  )
}
