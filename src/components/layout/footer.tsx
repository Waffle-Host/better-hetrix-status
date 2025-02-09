export function Footer() {
  return (
    <footer className="mt-auto border-t backdrop-blur-md transition-all duration-300 border-border/40 bg-background/80">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col items-center text-center sm:text-left text-sm space-y-4">
          <div className="flex flex-col items-center sm:items-start space-y-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-1">
              <span>Powered by</span>
              <a 
                href="https://hetrixtools.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="transition-colors duration-200 hover:text-amber-500 inline-flex items-center gap-1"
              >
                Hetrix Tools
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <span>and</span>
              <a 
                href="https://github.com/Waffle-Host/better-hetrix-status" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="transition-colors duration-200 hover:text-amber-500 inline-flex items-center gap-1"
              >
                Better-Hetrix-Page
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-1">
              <span>Custom Made for</span>
              <a 
                href="https://waffle.host" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="transition-colors duration-200 hover:text-amber-500 inline-flex items-center gap-1"
              >
                Waffle.host
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <span>by</span>
              <a 
                href="https://irazz.lol" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="transition-colors duration-200 hover:text-amber-500 inline-flex items-center gap-1"
              >
                irazz.lol
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
          <div className="text-muted-foreground">
            &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </footer>
  );
}