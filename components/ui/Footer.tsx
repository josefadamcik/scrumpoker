export function Footer() {
  return (
    <footer className="mt-auto py-8 px-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              This app will remain <strong>ad-free forever</strong> 🎉
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              If you find it useful, consider supporting its development and hosting costs
            </p>
          </div>

          <a
            href='https://ko-fi.com/B0B2D03MR'
            target='_blank'
            rel='noopener noreferrer'
            className="inline-block transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 rounded"
          >
            <img
              height='36'
              style={{border: 0, height: '36px'}}
              src='https://storage.ko-fi.com/cdn/kofi2.png?v=6'
              alt='Buy Me a Coffee at ko-fi.com'
            />
          </a>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Made by{' '}
            <a
              href="https://adamcik.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline decoration-dotted underline-offset-2 transition-colors"
            >
              Josef Adamčík
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
