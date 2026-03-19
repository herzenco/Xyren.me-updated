import { Headphones } from 'lucide-react'

export function ChatWidget() {
  return (
    <a
      href="https://wa.me/17865893484"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 hidden md:flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-glow hover:scale-105 transition-transform"
      aria-label="Chat with us"
    >
      <Headphones className="h-6 w-6 text-primary-foreground" />
    </a>
  )
}
