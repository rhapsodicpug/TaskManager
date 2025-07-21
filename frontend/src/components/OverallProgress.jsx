import React, { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

function OverallProgress({ projects, isOpen }) {
  const theme = useTheme();

  const { totalTasks, completedTasks } = useMemo(() => {
    let total = 0;
    let completed = 0;
    for (const project of projects) {
      total += project.task_count;
      completed += project.completed_count;
    }
    return { totalTasks: total, completedTasks: completed };
  }, [projects]);

  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const data = {
    datasets: [
      {
        data: [completedTasks, totalTasks - completedTasks],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.divider,
        ],
        borderColor: theme.palette.background.default,
        borderWidth: 4,
        hoverBorderWidth: 4,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    cutout: '80%',
    plugins: {
      tooltip: {
        enabled: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: isOpen ? 'flex-start' : 'center' }}>
      <Box sx={{ position: 'relative', width: 64, height: 64 }}>
        <Doughnut data={data} options={options} />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {`${progressPercentage}%`}
          </Typography>
        </Box>
      </Box>
      {isOpen && (
        <Box sx={{ ml: 2 }}>
          <Typography variant="h6">{getISTGreeting()}</Typography>
          <Typography variant="body2" color="text.secondary">
            {completedTasks} of {totalTasks} tasks done
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// Helper function to get greeting based on IST time
function getISTGreeting() {
  // Get current UTC time
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60; // in minutes
  const localOffset = now.getTimezoneOffset(); // in minutes
  const istTime = new Date(now.getTime() + (istOffset + localOffset) * 60000);
  const hour = istTime.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default OverallProgress;