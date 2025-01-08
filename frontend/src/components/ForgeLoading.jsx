import React from 'react';
import { motion } from 'framer-motion';
import { Hammer } from 'lucide-react';

export default function ForgeLoading() {
    return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="relative w-12 h-12"
          animate={{
            rotate: [-45, 45, -45],
            y: [0, 6, 0]
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <Hammer
            strokeWidth={2.5}
            className="w-full h-full text-gray-800"
          />
        </motion.div>
      </div>
    );
}
