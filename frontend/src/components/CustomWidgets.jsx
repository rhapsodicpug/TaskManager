import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, Divider, TextField, Button, Paper, IconButton, Tooltip, Switch, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const PRODUCTIVITY_TIPS = [
  'Take regular breaks to stay focused.',
  'Prioritize your most important tasks first.',
  'Set clear, achievable goals for the day.',
  'Eliminate distractions while working.',
  'Review your progress at the end of the day.'
];

const DAILY_QUOTES = [
  '"The secret of getting ahead is getting started." – Mark Twain',
  '"Productivity is never an accident." – Paul J. Meyer',
  '"It’s not always that we need to do more but rather that we need to focus on less." – Nathan W. Morris',
  '"The way to get started is to quit talking and begin doing." – Walt Disney',
  '"Success is the sum of small efforts, repeated day in and day out." – Robert Collier'
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const DEFAULT_WIDGETS = [
  { key: 'tip', label: 'Productivity Tip', visible: true },
  { key: 'quote', label: 'Daily Quote', visible: true },
  { key: 'notes', label: 'Quick Notes', visible: true },
  { key: 'weather', label: 'Weather', visible: false },
];

function CustomWidgets({ isOpen }) {
  const [note, setNote] = useState('');
  const [savedNotes, setSavedNotes] = useState(() => {
    const stored = localStorage.getItem('quickNotes');
    return stored ? JSON.parse(stored) : [];
  });
  const [tip] = useState(getRandomItem(PRODUCTIVITY_TIPS));
  const [quote] = useState(getRandomItem(DAILY_QUOTES));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [widgets, setWidgets] = useState(() => {
    const stored = localStorage.getItem('widgetsOrder');
    return stored ? JSON.parse(stored) : DEFAULT_WIDGETS;
  });
  const [draggingIndex, setDraggingIndex] = useState(null);
  // Weather widget state
  const [city, setCity] = useState(() => localStorage.getItem('weatherCity') || '');
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');

  useEffect(() => {
    localStorage.setItem('quickNotes', JSON.stringify(savedNotes));
  }, [savedNotes]);
  useEffect(() => {
    localStorage.setItem('widgetsOrder', JSON.stringify(widgets));
  }, [widgets]);
  useEffect(() => {
    if (city) {
      setWeatherLoading(true);
      setWeatherError('');
      fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`)
        .then(res => res.json())
        .then(data => {
          if (data && data.current_condition && data.current_condition[0]) {
            setWeather(data.current_condition[0]);
          } else {
            setWeather(null);
            setWeatherError('No data');
          }
        })
        .catch(() => setWeatherError('Failed to fetch weather'))
        .finally(() => setWeatherLoading(false));
    }
  }, [city]);
  useEffect(() => {
    localStorage.setItem('weatherCity', city);
  }, [city]);

  const handleSaveNote = () => {
    if (note.trim()) {
      setSavedNotes(prev => [...prev, note]);
      setNote('');
    }
  };
  const handleDeleteNote = (index) => {
    setSavedNotes(prev => prev.filter((_, i) => i !== index));
  };
  const handleToggleWidget = (key) => {
    setWidgets(widgets => widgets.map(w => w.key === key ? { ...w, visible: !w.visible } : w));
  };
  // Drag and drop reorder logic
  const handleDragStart = (index) => {
    setDraggingIndex(index);
  };
  const handleDragOver = (index) => {
    if (draggingIndex === null || draggingIndex === index) return;
    setWidgets(widgets => {
      const newWidgets = [...widgets];
      const [removed] = newWidgets.splice(draggingIndex, 1);
      newWidgets.splice(index, 0, removed);
      return newWidgets;
    });
    setDraggingIndex(index);
  };
  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{ marginTop: 16, willChange: 'transform, opacity' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>Custom Widgets</Typography>
            <Tooltip title="Widget Settings">
              <IconButton size="small" onClick={() => setSettingsOpen(o => !o)}>
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                style={{ willChange: 'transform, opacity' }}
              >
                <Paper variant="outlined" sx={{ p: 1, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Show/Hide & Reorder Widgets</Typography>
                  {widgets.map((w, i) => (
                    <Box key={w.key} sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'grab' }} draggable onDragStart={() => handleDragStart(i)} onDragOver={e => { e.preventDefault(); handleDragOver(i); }} onDragEnd={handleDragEnd}>
                      <DragIndicatorIcon sx={{ mr: 1, opacity: 0.7 }} fontSize="small" />
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>{w.label}</Typography>
                      <Switch size="small" checked={w.visible} onChange={() => handleToggleWidget(w.key)} />
                    </Box>
                  ))}
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
          <Divider sx={{ my: 1 }} />
          <motion.div
            variants={{}}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ staggerChildren: 0.09, delayChildren: 0.12 }}
          >
            <AnimatePresence>
              {widgets.find(w => w.key === 'tip' && w.visible) && (
                <motion.div
                  key="tip"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                  style={{ willChange: 'transform, opacity' }}
                >
                  <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>Productivity Tip</Typography>
                    <Typography variant="body2">{tip}</Typography>
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {widgets.find(w => w.key === 'quote' && w.visible) && (
                <motion.div
                  key="quote"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                  style={{ willChange: 'transform, opacity' }}
                >
                  <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>Daily Quote</Typography>
                    <Typography variant="body2">{quote}</Typography>
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {widgets.find(w => w.key === 'notes' && w.visible) && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                  style={{ willChange: 'transform, opacity' }}
                >
                  <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>Quick Notes</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField size="small" value={note} onChange={e => setNote(e.target.value)} placeholder="Add note..." fullWidth onKeyDown={e => { if (e.key === 'Enter') handleSaveNote(); }} />
                      <Button size="small" variant="contained" onClick={handleSaveNote}>Save</Button>
                    </Box>
                    {savedNotes.length > 0 && savedNotes.map((n, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>{n}</Typography>
                        <IconButton size="small" onClick={() => handleDeleteNote(i)}><DeleteIcon fontSize="small" /></IconButton>
                      </Box>
                    ))}
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {widgets.find(w => w.key === 'weather' && w.visible) && (
                <motion.div
                  key="weather"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                  style={{ willChange: 'transform, opacity' }}
                >
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>Weather</Typography>
                  <TextField
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Enter city name"
                    size="small"
                    fullWidth
                    sx={{ mb: 1 }}
                  />
                  <AnimatePresence>
                    {weatherLoading ? (
                      <motion.div
                        key="weather-loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 40 }}>
                          <CircularProgress size={20} />
                        </Box>
                      </motion.div>
                    ) : weatherError ? (
                      <Typography color="error" variant="body2">{weatherError}</Typography>
                    ) : weather ? (
                      <Paper variant="outlined" sx={{ p: 1, mb: 1, fontSize: '0.95em' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{city}</Typography>
                        <Typography variant="body2">{weather.temp_C}°C, {weather.weatherDesc[0].value}</Typography>
                        <Typography variant="caption" color="text.secondary">Feels like: {weather.FeelsLikeC}°C</Typography>
                      </Paper>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CustomWidgets; 