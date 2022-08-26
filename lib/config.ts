export default function env(name: string): string {
  return process.env[name] || ''
}
