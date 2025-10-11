"use client"

import { motion } from "framer-motion"

const faceBase =
  "absolute inset-0 rounded-xl border border-white/20 shadow-lg shadow-black/10"

export default function LoadingCube() {
  const size = 120 // px
  const half = size / 2

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8 sm:gap-10">
      <div style={{ perspective: 800 }}>
        <motion.div
          initial={{ rotateX: 0, rotateY: 0 }}
          animate={{ rotateX: 360, rotateY: 360 }}
          transition={{ duration: 8, ease: "linear", repeat: Infinity, repeatType: "loop" }}
          style={{
            width: size,
            height: size,
            transformStyle: "preserve-3d",
            position: "relative",
          }}
        >
          {/* Front */}
          <div
            className={`${faceBase} bg-gradient-to-br from-blue-500 to-indigo-500`}
            style={{ transform: `translateZ(${half}px)`, backfaceVisibility: "hidden" }}
          />
          {/* Back */}
          <div
            className={`${faceBase} bg-gradient-to-br from-indigo-500 to-blue-500`}
            style={{ transform: `rotateY(180deg) translateZ(${half}px)`, backfaceVisibility: "hidden" }}
          />
          {/* Right */}
          <div
            className={`${faceBase} bg-gradient-to-br from-violet-500 to-fuchsia-500`}
            style={{ transform: `rotateY(90deg) translateZ(${half}px)`, backfaceVisibility: "hidden" }}
          />
          {/* Left */}
          <div
            className={`${faceBase} bg-gradient-to-br from-fuchsia-500 to-violet-500`}
            style={{ transform: `rotateY(-90deg) translateZ(${half}px)`, backfaceVisibility: "hidden" }}
          />
          {/* Top */}
          <div
            className={`${faceBase} bg-gradient-to-br from-cyan-500 to-teal-500`}
            style={{ transform: `rotateX(90deg) translateZ(${half}px)`, backfaceVisibility: "hidden" }}
          />
          {/* Bottom */}
          <div
            className={`${faceBase} bg-gradient-to-br from-teal-500 to-cyan-500`}
            style={{ transform: `rotateX(-90deg) translateZ(${half}px)`, backfaceVisibility: "hidden" }}
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mt-8 sm:mt-10"
      >
        <h2 className="text-xl sm:text-2xl font-extrabold italic tracking-tight bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent drop-shadow-sm">
          Hang tight — we’re preparing your results!
        </h2>
      </motion.div>
    </div>
  )
}


