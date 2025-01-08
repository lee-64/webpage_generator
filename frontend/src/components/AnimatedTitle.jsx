import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const animations = {
    typewriter: {
        animate: i => ({
            opacity: [0, 1],
            x: [-10, 0],
            transition: {
                duration: 0.8,
                ease: [0.215, 0.610, 0.355, 1.000],
                delay: i * 0.1
            }
        })
    },
    shimmer: {
        animate: i => ({
            opacity: [1, 0.7, 1],
            filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
            transition: {
                duration: 2.5,
                times: [0, 0.5, 1],
                delay: i * 0.08,
                ease: 'easeInOut'
            }
        })
    },
    float: {
        animate: i => ({
            y: [0, -8, 0],
            transition: {
                duration: 2,
                ease: 'easeInOut',
                repeat: 1,
                delay: i * 0.04
            }
        })
    },
    forge: {
        animate: i => ({
            scale: [1, 1.05, 1],
            filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'],
            transition: {
                duration: 1.8,
                ease: [0.34, 1.56, 0.64, 1],
                delay: i * 0.06
            }
        })
    },
    cascade: {
        animate: i => ({
            opacity: [0, 1],
            y: [-15, 0],
            transition: {
                duration: 1.2,
                ease: [0.215, 0.610, 0.355, 1.000],
                delay: i * 0.12
            }
        })
    },
    pulse: {
        animate: i => ({
            scale: [1, 1.02, 1],
            opacity: [1, 0.9, 1],
            transition: {
                duration: 2.2,
                times: [0, 0.5, 1],
                delay: i * 0.03,
                ease: 'easeInOut'
            }
        })
    },
    elegant: {
        animate: i => ({
            opacity: [0.8, 1],
            scale: [0.98, 1],
            y: [2, 0],
            transition: {
                duration: 1.6,
                ease: [0.34, 1.56, 0.64, 1],
                delay: i * 0.07
            }
        })
    }
};

// Color schemes
const colorSchemes = [
    'from-violet-500 via-fuchsia-500 to-pink-500',
    'from-cyan-500 via-blue-500 to-purple-500',
    'from-emerald-500 via-teal-500 to-cyan-500',
    'from-rose-500 via-pink-500 to-purple-500',
    'from-amber-500 via-orange-500 to-red-500'
];

export default function AnimatedTitle() {
    const [animationKey, setAnimationKey] = useState('');
    const [colorScheme, setColorScheme] = useState(colorSchemes[0]);
    const [isChanging, setIsChanging] = useState(false);

    const letters = ['F', 'o', 'r', 'g', 'e', 'U', 'I'];

    const changeStyle = () => {
        setIsChanging(true);
        const newAnimation = Object.keys(animations)[Math.floor(Math.random() * Object.keys(animations).length)];
        const newColor = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];

        setTimeout(() => {
            setAnimationKey(newAnimation);
            setColorScheme(newColor);
            setIsChanging(false);
        }, 300);
    };

    useEffect(() => {
        const interval = setInterval(changeStyle, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative mx-auto px-4 py-8 max-w-4xl">
            <div className="flex flex-col items-center justify-center">
                {/* Title */}
                <div className="flex flex-col items-center justify-center mb-4">
                    <h1 className="text-6xl md:text-7xl font-bold relative z-10">
                        <AnimatePresence mode="wait">
                            {letters.map((letter, i) => (
                                <motion.span
                                    key={`${letter}-${animationKey}-${i}`}
                                    className={`inline-block ${
                                        i > 4 ? `bg-gradient-to-r ${colorScheme} bg-clip-text text-transparent` : ''
                                    }`}
                                    initial={{ opacity: 1 }}
                                    animate={animations[animationKey]?.animate(i) || {}}
                                    transition={{ duration: 0.5 }}
                                >
                                    {<a href=''>{letter}</a>}
                                </motion.span>
                            ))}
                        </AnimatePresence>
                    </h1>
                </div>

                {/* Groq Attribution */}
                <motion.div
                    className="flex items-center justify-center mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <span className="text-sm font-mono text-gray-400">
                        Powered by&nbsp;
                    </span>
                    <a
                        href="https://groq.com/"
                        className="hover:opacity-80 transition-opacity inline-flex items-center"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img
                            src="https://www.ciscoinvestments.com/assets/logos/groq-logo.png"
                            alt="groq"
                            className="h-4 inline-block mt-1.5"
                        />
                    </a>
                </motion.div>
            </div>
        </div>
    );
}