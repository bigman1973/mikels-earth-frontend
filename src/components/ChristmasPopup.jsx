import { useState, useEffect } from 'react';
import { X, Gift, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ChristmasPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if popup was already shown in this session
    const popupShown = sessionStorage.getItem('christmas_popup_shown');
    
    if (!popupShown) {
      // Show popup after 1 second
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('christmas_popup_shown', 'true');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleViewOffer = () => {
    setIsOpen(false);
    navigate('/producto/pack-navidad-completo');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Popup */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border-4 border-yellow-600"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 20, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{ 
                    rotate: [360, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 15, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl"
                />
              </div>

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Content */}
              <div className="relative z-10 p-8 text-center">
                {/* Icon */}
                <motion.div
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="inline-block mb-4"
                >
                  <div className="relative">
                    <Gift className="w-20 h-20 text-yellow-400 drop-shadow-lg" />
                    <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
                  </div>
                </motion.div>

                {/* Title */}
                <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  🎄 Especial Navidad
                </h2>
                <p className="text-yellow-300 text-lg font-semibold mb-4 drop-shadow">
                  Edición Limitada
                </p>

                {/* Description */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
                  <p className="text-white text-lg leading-relaxed mb-3">
                    El regalo perfecto para estas fiestas
                  </p>
                  <p className="text-yellow-200 text-base">
                    Pack completo con aceites premium, conservas artesanales y estuche degustación
                  </p>
                </div>

                {/* Badges */}
                <div className="flex justify-center gap-3 mb-6 flex-wrap">
                  <span className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-bold shadow-lg">
                    ⭐ Edición Limitada
                  </span>
                  <span className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-bold shadow-lg">
                    🎁 Regalo Ideal
                  </span>
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleViewOffer}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-green-900 font-bold text-lg py-4 rounded-xl shadow-2xl hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 transform hover:shadow-yellow-500/50 mb-3"
                >
                  🎁 Ver Oferta Especial
                </motion.button>

                <button
                  onClick={handleClose}
                  className="text-white/70 hover:text-white text-sm transition-colors underline"
                >
                  Continuar navegando
                </button>
              </div>

              {/* Bottom decoration */}
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600" />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChristmasPopup;

