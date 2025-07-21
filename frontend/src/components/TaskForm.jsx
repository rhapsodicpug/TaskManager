import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Stack, ToggleButtonGroup, ToggleButton, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Typography, Fade, Tooltip, Divider } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import EventIcon from '@mui/icons-material/Event';
import FlagIcon from '@mui/icons-material/Flag';
import FolderIcon from '@mui/icons-material/Folder';

const PRIORITY_COLORS = {
  1: 'success.main',
  2: 'warning.main',
  3: 'error.main',
};

function TaskForm({ onAdd, onCancel, projects, selectedProjectId }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(1);
  const [projectId, setProjectId] = useState(selectedProjectId || (projects[0]?.id || ''));
  const [dueDate, setDueDate] = useState(null);
  const [titleError, setTitleError] = useState(false);

  useEffect(() => {
    setProjectId(selectedProjectId || (projects[0]?.id || ''));
  }, [selectedProjectId, projects]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    setTitleError(false);
    const formattedDueDate = dueDate ? format(dueDate, 'yyyy-MM-dd') : null;
    onAdd({ 
      title, 
      description,
      priority, 
      project_id: projectId, 
      due_date: formattedDueDate 
    });
    setTitle('');
    setDescription('');
  };

  return (
    <Fade in>
      <Card
        elevation={2}
        sx={{
          borderRadius: 2,
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)',
          mb: 2,
          width: '100%',
          maxWidth: 420,
          mx: 'auto',
          p: 0,
          background: theme => theme.palette.background.paper,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, letterSpacing: 0.2 }}>
            Add New Task
          </Typography>
          <Box component="form" onSubmit={handleSubmit} autoComplete="off">
            <Stack spacing={2}>
              <TextField
                label="Task name"
                variant="outlined"
                size="medium"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                error={titleError}
                helperText={titleError ? "Task title cannot be empty." : ''}
                sx={{ borderRadius: 1 }}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth size="small" variant="outlined" sx={{ borderRadius: 1 }}>
                <InputLabel id="project-select-label" shrink><FolderIcon sx={{ mr: 1, fontSize: 18, verticalAlign: 'middle', color: 'action.active' }} /> Project</InputLabel>
                <Select
                  labelId="project-select-label"
                  value={projectId}
                  label="Project"
                  onChange={(e) => setProjectId(e.target.value)}
                  startAdornment={<FolderIcon color="action" sx={{ mr: 1 }} />}
                  sx={{ borderRadius: 1 }}
                >
                  {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
              <DatePicker
                label={<span><EventIcon sx={{ mr: 1, fontSize: 18, verticalAlign: 'middle', color: 'action.active' }} /> Due Date</span>}
                value={dueDate}
                onChange={(newValue) => setDueDate(newValue)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    variant: 'outlined',
                    sx: { minWidth: 140, borderRadius: 1 },
                    InputLabelProps: { shrink: true },
                  },
                  popper: { placement: 'bottom-start' }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" sx={{ mr: 2, minWidth: 70, color: 'text.secondary' }}>Priority</Typography>
                <ToggleButtonGroup
                  value={priority}
                  exclusive
                  size="small"
                  onChange={(e, newPriority) => { if (newPriority !== null) setPriority(newPriority); }}
                  sx={{ borderRadius: 1 }}
                >
                  <Tooltip title="Low Priority"><ToggleButton value={1} sx={{ color: PRIORITY_COLORS[1], fontWeight: 500, borderRadius: 1 }}>Low</ToggleButton></Tooltip>
                  <Tooltip title="Medium Priority"><ToggleButton value={2} sx={{ color: PRIORITY_COLORS[2], fontWeight: 500, borderRadius: 1 }}>Med</ToggleButton></Tooltip>
                  <Tooltip title="High Priority"><ToggleButton value={3} sx={{ color: PRIORITY_COLORS[3], fontWeight: 500, borderRadius: 1 }}>High</ToggleButton></Tooltip>
                </ToggleButtonGroup>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <TextField
                label="Description (optional)"
                variant="outlined"
                size="medium"
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                sx={{ borderRadius: 1 }}
                InputLabelProps={{ shrink: true }}
              />
              <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" color="primary" size="medium" sx={{ borderRadius: 1, fontWeight: 600, px: 4 }}>
                  Add Task
                </Button>
                <Button variant="outlined" size="medium" sx={{ borderRadius: 1, fontWeight: 500 }} onClick={onCancel}>
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
}

export default TaskForm;