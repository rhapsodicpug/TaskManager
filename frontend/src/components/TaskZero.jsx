import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from '@uidotdev/usehooks';

const CelebrationIcon = () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="#4caf50"/>
    </svg>
);

function TaskZero() {
  const { width, height } = useWindowSize();

  return (
    <Box sx={{ textAlign: 'center', py: 6, position: 'relative' }}>
      <ReactConfetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={200}
        gravity={0.1}
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <CelebrationIcon />
        <Typography variant="h6" sx={{ mt: 2, fontWeight: '500' }}>
          You're all caught up!
        </Typography>
        <Typography color="text.secondary">
          Enjoy your day.
        </Typography>
      </motion.div>
    </Box>
  );
}

export default TaskZero;