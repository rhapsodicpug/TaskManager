import React from 'react';
import { ListItem, ListItemText, IconButton, Checkbox, Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { format, isPast, isToday } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';

const priorityColors = {
  1: 'info.main',
  2: 'warning.main',
  3: 'error.main',
};

function TaskItem({ task, onUpdateStatus, onEdit, onDelete, selected, onSelect }) {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' } },
    exit: { x: -300, opacity: 0 },
  };

  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
  
  const formattedDate = task.due_date ? format(new Date(task.due_date), 'MMM d') : '';
  const dateColor = isOverdue ? 'error.main' : 'text.secondary';

  return (
    <motion.div
      variants={itemVariants}
      layout
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ scale: 1.025, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}
      whileTap={{ scale: 0.98, boxShadow: '0 1px 4px 0 rgba(0,0,0,0.10)' }}
      style={{ willChange: 'transform, opacity' }}
    >
      <ListItem
        disablePadding
        component={motion.div}
        whileHover={{ backgroundColor: 'action.hover', scale: 1.01 }}
        sx={{ borderRadius: 2, mb: 1.5, border: 1, borderColor: 'divider', bgcolor: 'background.paper', transition: 'box-shadow 0.2s' }}
        secondaryAction={
          <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}>
            <DeleteIcon fontSize="small" sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }} />
          </IconButton>
        }
      >
        <Checkbox
          edge="start"
          checked={selected}
          tabIndex={-1}
          disableRipple
          onClick={e => { e.stopPropagation(); onSelect(task.id); }}
          sx={{ ml: 1 }}
        />
        <Box
          onClick={() => onEdit(task)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            cursor: 'pointer',
            p: '8px 16px',
            // CORRECTED: Add margin to the right to make space for the delete button
            mr: '56px',
          }}
        >
          <Checkbox
            edge="start"
            checked={task.is_complete}
            tabIndex={-1}
            disableRipple
            onClick={(e) => { e.stopPropagation(); onUpdateStatus(task.id, { is_complete: !task.is_complete }); }}
          />
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: priorityColors[task.priority], mr: 1.5, flexShrink: 0 }} />
          <ListItemText
            primary={task.title}
            sx={{
              textDecoration: task.is_complete ? 'line-through' : 'none',
              color: task.is_complete ? 'text.secondary' : 'text.primary',
            }}
          />
          {formattedDate && (
            <Chip label={formattedDate} size="small" sx={{ ml: 2, color: dateColor, borderColor: dateColor }} variant="outlined" />
          )}
        </Box>
      </ListItem>
    </motion.div>
  );
}

export default TaskItem;