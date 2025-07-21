import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { parseISO } from 'date-fns';

function EditTaskDialog({ open, onClose, task, onSave, projects }) {
  const [editedTitle, setEditedTitle] = useState('');
  const [editedProjectId, setEditedProjectId] = useState('');
  const [editedDueDate, setEditedDueDate] = useState(null);

  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedProjectId(task.project_id);
      setEditedDueDate(task.due_date ? parseISO(task.due_date) : null);
    }
  }, [task]);

  const handleSave = () => {
    onSave(task.id, {
      title: editedTitle,
      project_id: editedProjectId,
      due_date: editedDueDate,
    });
  };

  if (!task) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Task</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{pt: 1}}>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            type="text"
            fullWidth
            variant="outlined"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            // ADDED: Helper text
            helperText="Enter the new title for your task."
          />
          <FormControl fullWidth>
            <InputLabel>Project</InputLabel>
            <Select value={editedProjectId} label="Project" onChange={(e) => setEditedProjectId(e.target.value)}>
              {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
          <DatePicker label="Due Date" value={editedDueDate} onChange={(newValue) => setEditedDueDate(newValue)} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}
export default EditTaskDialog;