import { MotionDiv } from "@/components/ui/motion"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import Image from "next/image"
import { memo } from "react"

export const Header = memo(function Header() {
  return (
    <header className="sticky top-0 z-10 border-b backdrop-blur-md transition-all duration-300 border-border/40 bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <MotionDiv 
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <a 
            href="https://waffle.host" 
            className="flex items-center gap-4 hover:opacity-80 transition-opacity"
            aria-label="Go to Waffle.Host homepage"
          >
            <MotionDiv 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              role="img"
            >
              <Image 
                src="/logo.png" 
                alt="Waffle.Host Logo" 
                width={64} 
                height={64} 
                className="relative h-12 w-12 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-primary/25"
              />
            </MotionDiv>
            <span className="text-xl font-semibold tracking-tight">
              Waffle.Host
            </span>
          </a>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ThemeToggle />
        </MotionDiv>
      </div>
    </header>
  )
})