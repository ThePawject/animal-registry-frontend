import { motion } from 'framer-motion'

export function LoadingSpinner() {
  const logoContent = (
    <img
      src="/animal-shelter-logo.png"
      alt="MojeSchronisko"
      className="size-48 object-contain relative z-10"
    />
  )

  return (
    <div className="flex flex-col items-center justify-center gap-0">
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 3,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
        className="relative"
      >
        {logoContent}
        <motion.div
          className="absolute inset-0 blur-xl bg-emerald-400/30 rounded-full -z-10"
          animate={{
            scale: [0.8, 1.03, 0.8],
          }}
          transition={{
            duration: 3,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
      </motion.div>
      <img
        src="./moje_schronisko_text.png"
        alt="MojeSchronisko"
        className="size-auto h-12 object-contain"
      />
    </div>
  )
}
