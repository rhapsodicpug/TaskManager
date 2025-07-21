import { List, Box, Button, Typography, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import TaskItem from './TaskItem';

function TaskList({ tasks, onDelete, onUpdateStatus, onEdit, selectedTasks, setSelectedTasks, onBulkDelete, onBulkComplete, onBulkMove }) {
  const handleSelect = (id) => {
    setSelectedTasks(selected => selected.includes(id) ? selected.filter(tid => tid !== id) : [...selected, id]);
  };
  const allSelected = tasks.length > 0 && selectedTasks.length === tasks.length;
  const handleSelectAll = () => {
    if (allSelected) setSelectedTasks([]);
    else setSelectedTasks(tasks.map(t => t.id));
  };
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }} style={{ willChange: 'transform, opacity' }}>
      <AnimatePresence>
        {selectedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          >
            <Paper sx={{ mb: 2, p: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">{selectedTasks.length} selected</Typography>
              <Button size="small" color="error" variant="contained" onClick={onBulkDelete}>Delete</Button>
              <Button size="small" color="primary" variant="contained" onClick={onBulkComplete}>Mark Complete</Button>
              {onBulkMove && <Button size="small" color="secondary" variant="contained" onClick={onBulkMove}>Move</Button>}
              <Button size="small" onClick={() => setSelectedTasks([])}>Clear</Button>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
      <List component={motion.ul} variants={{}} initial="hidden" animate="visible" exit="hidden" sx={{p:0}} transition={{ staggerChildren: 0.07, delayChildren: 0.1 }}>
        <AnimatePresence>
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onDelete={onDelete} onUpdateStatus={onUpdateStatus} onEdit={onEdit} selected={selectedTasks.includes(task.id)} onSelect={handleSelect} />
          ))}
        </AnimatePresence>
      </List>
      {tasks.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Button size="small" onClick={handleSelectAll}>{allSelected ? 'Deselect All' : 'Select All'}</Button>
        </Box>
      )}
    </motion.div>
  );
}
export default TaskList;