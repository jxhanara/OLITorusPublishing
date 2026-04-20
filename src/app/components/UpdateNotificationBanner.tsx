import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UpdateNotificationBannerProps {
  message: string;
  onViewChanges?: () => void;
  autoDismissDelay?: number;
}

export function UpdateNotificationBanner({
  message,
  onViewChanges,
  autoDismissDelay = 10000,
}: UpdateNotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoDismissDelay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoDismissDelay);

      return () => clearTimeout(timer);
    }
  }, [autoDismissDelay]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-4 right-4 z-50 w-[360px]"
        >
          <div className="bg-primary text-primary-foreground rounded-lg shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/80 rounded-full flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">Update Available</h4>
                <p className="text-sm text-primary-foreground/90 mb-3">{message}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onViewChanges}
                  className="bg-card text-primary hover:bg-card/90"
                >
                  View Changes
                </Button>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="flex-shrink-0 w-5 h-5 rounded hover:bg-primary/80 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
