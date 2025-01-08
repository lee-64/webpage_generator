import React from 'react';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import APIKeyInput from './APIKeyInput';


export const ConfigButton = ({ onClick }) => (
    <button
        onClick={onClick}
        className="h-[52px] px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
    >
        <Menu className="w-6 h-6 text-gray-600" />
    </button>
);


export const ConfigMenu = ({
    isOpen,
    onClose,
    sliderValue,
    setSliderValue,
    modelSize,
    setModelSize,
    apiKey,
    setApiKey,
    onSave
}) => {
    const handleClose = async () => {
        // Call onSave before closing
        if (onSave) {
            await onSave();
        }
        onClose();
    };
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50"
                        onClick={handleClose}
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-8 w-96 border border-gray-100"
                    >
                        <div className="space-y-8">
                            <div>
                                <div className="space-y-8">
                                    <APIKeyInput
                                        value={apiKey}
                                        onChange={setApiKey}
                                    />
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-700">
                                            Response Count <span className="text-gray-500">({sliderValue})</span>
                                        </label>
                                        <Slider
                                            value={[sliderValue]}
                                            onValueChange={(value) => setSliderValue(value[0])}
                                            min={1}
                                            max={6}
                                            step={1.0}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-700">Model Type</label>
                                        <div className="flex items-center space-x-3">
                                            <span className={`text-sm font-medium ${modelSize === '8B' ? 'text-gray-900' : 'text-gray-400'}`}>
                                                8B
                                            </span>
                                            <Switch
                                                checked={modelSize === '70B'}
                                                onCheckedChange={(checked) => setModelSize(checked ? '70B' : '8B')}
                                            />
                                            <span className={`text-sm font-medium ${modelSize === '70B' ? 'text-gray-900' : 'text-gray-400'}`}>
                                                70B
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleClose}
                                className="w-full bg-gray-900 text-white rounded-lg py-2.5 font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}