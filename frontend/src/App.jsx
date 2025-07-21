import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axios from 'axios';
import { Typography, CssBaseline, Box, Paper, Snackbar, Alert, useMediaQuery, Drawer, Fab, Container, Toolbar, Popover, List, ListItem, ListItemText, Modal, Button } from '@mui/material'; // CORRECTED
import AddIcon from '@mui/icons-material/Add';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import Header from './components/Header';
import TaskListSkeleton from './components/TaskListSkeleton';
import TaskZero from './components/TaskZero';
import EditTaskDialog from './components/EditTaskDialog';
import ConfirmationDialog from './components/ConfirmationDialog';
import getDesignTokens from './theme';
import { motion, AnimatePresence } from 'framer-motion';
import { SketchPicker } from 'react-color';

const API_URL = 'http://127.0.0.1:8000';
const SIDEBAR_WIDTH = 280;
const THEME_COLORS = ['#8A72FF', '#3b82f6', '#22c55e', '#ef4444', '#f97316'];

function App() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const expanded = isSidebarOpen || sidebarHovered;
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'dark');
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('themeColor') || THEME_COLORS[0]);
  const [editingTask, setEditingTask] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showTour, setShowTour] = useState(() => !localStorage.getItem('tourComplete'));
  const [tourStep, setTourStep] = useState(0);
  
  const theme = useMemo(() => createTheme(getDesignTokens(mode, primaryColor)), [mode, primaryColor]);
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(mode);
  }, [mode]);
  
  useEffect(() => { localStorage.setItem('themeColor', primaryColor); }, [primaryColor]);

  const fetchAllData = () => {
    setLoading(true);
    const fetchProjects = axios.get(`${API_URL}/projects/`);
    const fetchTasks = axios.get(`${API_URL}/tasks/`, { params: { project_id: selectedProjectId } });
    const fetchNotifications = axios.get(`${API_URL}/notifications/`);
    Promise.all([fetchProjects, fetchTasks, fetchNotifications])
      .then(([projectsRes, tasksRes, notificationsRes]) => { setProjects(projectsRes.data); setTasks(tasksRes.data); setNotifications(notificationsRes.data); })
      .catch(error => { console.error("Error fetching data:", error); setSnackbar({ open: true, message: 'Failed to fetch data.', severity: 'error' }); })
      .finally(() => setLoading(false));
  };
  
  useEffect(fetchAllData, [selectedProjectId]);

  const handleProjectsChange = () => { setIsAddingProject(false); setSnackbar({ open: true, message: 'Project created!', severity: 'success' }); fetchAllData(); };
  
  const handleDeleteProject = (projectId) => {
    axios.delete(`${API_URL}/projects/${projectId}`).then(() => {
      setSnackbar({ open: true, message: 'Project deleted!', severity: 'warning' });
      setSelectedProjectId(null);
    });
  };

  const handleTaskAdded = (newTaskData) => {
    axios.post(`${API_URL}/tasks/`, newTaskData).then(res => {
      setTasks(prevTasks => [...prevTasks, res.data]);
      setIsAddingTask(false);
      setSnackbar({ open: true, message: 'Task added!', severity: 'success' });
    }).catch(error => {
      console.error("Error adding task:", error);
      setSnackbar({ open: true, message: 'Failed to add task.', severity: 'error' });
    });
  };
  
  const handleDeleteTask = (id) => { axios.delete(`${API_URL}/tasks/${id}`).then(() => { setTasks(tasks.filter(task => task.id !== id)); setSnackbar({ open: true, message: 'Task deleted.', severity: 'info' }); }); };
  
  const handleUpdateTask = (id, updateData) => { axios.put(`${API_URL}/tasks/${id}`, updateData).then(res => { setTasks(tasks.map(task => (task.id === id ? res.data : task))); setEditingTask(null); setSnackbar({ open: true, message: 'Task updated!', severity: 'success' }); }); };
  
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  
  const toggleColorMode = (event) => {
    if (!document.startViewTransition) { setMode(prev => (prev === 'light' ? 'dark' : 'light')); return; }
    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const transition = document.startViewTransition(() => { setMode(prev => (prev === 'light' ? 'dark' : 'light')); });
    transition.ready.then(() => {
      const clipPath = [ `circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];
      document.documentElement.animate({ clipPath }, { duration: 600, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' });
    });
  };
  
  const handleNotificationClick = (event) => setNotificationAnchorEl(event.currentTarget);
  const handleNotificationClose = () => setNotificationAnchorEl(null);
  const openNotifications = Boolean(notificationAnchorEl);
  const handleSettingsClick = (event) => setSettingsAnchorEl(event.currentTarget);
  const handleSettingsClose = () => setSettingsAnchorEl(null);
  const openSettings = Boolean(settingsAnchorEl);

  const activeTasksCount = tasks.filter(task => !task.is_complete).length;
  const currentProject = projects.find(p => p.id === selectedProjectId);
  const headerTitle = currentProject ? currentProject.name : "All Tasks";
  
  const sidebarContent = ( <Sidebar isOpen={isDesktop ? isSidebarOpen : true} projects={projects} onProjectSelect={(id) => { setSelectedProjectId(id); if (!isDesktop) setIsSidebarOpen(false); }} selectedProjectId={selectedProjectId} onProjectsChange={handleProjectsChange} onDeleteProject={handleDeleteProject} isAddingProject={isAddingProject} onToggleAddProject={setIsAddingProject} /> );
  
  const renderContent = () => {
    if (loading) return <TaskListSkeleton />;
    if (projects.length === 0) return <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>Create a project to begin.</Typography>;
    if (tasks.length > 0) return <TaskList tasks={tasks} onDelete={handleDeleteTask} onUpdateStatus={handleUpdateTask} onEdit={setEditingTask} selectedTasks={selectedTasks} setSelectedTasks={setSelectedTasks} onBulkDelete={handleBulkDelete} onBulkComplete={handleBulkComplete} onBulkMove={handleBulkMove} />;
    return <TaskZero />;
  };

  const handleBulkDelete = () => {
    Promise.all(selectedTasks.map(id => axios.delete(`${API_URL}/tasks/${id}`)))
      .then(() => {
        setTasks(tasks => tasks.filter(task => !selectedTasks.includes(task.id)));
        setSelectedTasks([]);
        setSnackbar({ open: true, message: 'Tasks deleted.', severity: 'info' });
      });
  };
  const handleBulkComplete = () => {
    Promise.all(selectedTasks.map(id => axios.put(`${API_URL}/tasks/${id}`, { is_complete: true })))
      .then(() => {
        setTasks(tasks => tasks.map(task => selectedTasks.includes(task.id) ? { ...task, is_complete: true } : task));
        setSelectedTasks([]);
        setSnackbar({ open: true, message: 'Tasks marked complete.', severity: 'success' });
      });
  };
  const handleBulkMove = () => {
    // For demo: just clear selection
    setSelectedTasks([]);
    setSnackbar({ open: true, message: 'Move not implemented.', severity: 'info' });
  };
  const handleTourClose = () => {
    setShowTour(false);
    localStorage.setItem('tourComplete', '1');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        style={{ display: 'flex', height: '100vh', overflow: 'hidden', boxShadow: '0 4px 32px 0 rgba(138,114,255,0.07), 0 1.5px 8px 0 rgba(30,30,40,0.04)', borderRadius: 18 }}
      >
        <Header 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          onToggleTheme={toggleColorMode} 
          onSettingsClick={handleSettingsClick}
          notificationCount={notifications.length}
          onNotificationClick={handleNotificationClick}
          isSidebarOpen={expanded}
          isDesktop={isDesktop}
        />
        {isDesktop ? (
          <motion.div
            key={expanded ? 'sidebar-open' : 'sidebar-closed'}
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{ height: '100vh', willChange: 'transform, opacity' }}
          >
            <Sidebar
              isOpen={isSidebarOpen}
              projects={projects}
              onProjectSelect={setSelectedProjectId}
              selectedProjectId={selectedProjectId}
              onProjectsChange={handleProjectsChange}
              onDeleteProject={handleDeleteProject}
              isAddingProject={isAddingProject}
              onToggleAddProject={setIsAddingProject}
              hovered={sidebarHovered}
              setHovered={setSidebarHovered}
            />
          </motion.div>
        ) : (
          <Drawer variant="temporary" open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: SIDEBAR_WIDTH } }}>
            {sidebarContent}
          </Drawer>
        )}

        <motion.div
          key={selectedProjectId || 'all'}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto', willChange: 'transform, opacity' }}
        >
          <Toolbar />
          <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
              <Typography variant="h5">{headerTitle}</Typography>
              {!loading && <Typography variant="body2">{activeTasksCount} tasks remaining</Typography>}
            </Box>
            
            <AnimatePresence mode="wait">
              {isAddingTask && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                  <Paper sx={{ p: 2.5, mb: 3 }}>
                    <TaskForm onAdd={handleTaskAdded} onCancel={() => setIsAddingTask(false)} projects={projects} selectedProjectId={selectedProjectId} />
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>
            
            {renderContent()}
          </Container>
        </motion.div>
      </motion.div>

      {!isAddingTask && projects.length > 0 && (
        <Fab color="primary" aria-label="add task" onClick={() => setIsAddingTask(true)} sx={{ position: 'fixed', bottom: 40, right: 40 }}>
          <AddIcon />
        </Fab>
      )}
      
      <EditTaskDialog open={!!editingTask} onClose={() => setEditingTask(null)} task={editingTask} onSave={handleUpdateTask} projects={projects} />
      <Popover open={openNotifications} anchorEl={notificationAnchorEl} onClose={handleNotificationClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Box sx={{ p: 2, minWidth: 320, maxWidth: 360 }}>
          <Typography variant="h6" gutterBottom>Overdue Tasks</Typography>
          <List>
            {notifications.length > 0 ? ( notifications.map(task => ( <ListItem key={task.id} disablePadding><ListItemText primary={`"${task.title}" is overdue!`} secondary={`Due on: ${task.due_date}`} /></ListItem>)) ) : ( <Typography variant="body2" color="text.secondary">No overdue tasks.</Typography> )}
          </List>
        </Box>
      </Popover>

      <Popover open={openSettings} anchorEl={settingsAnchorEl} onClose={handleSettingsClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ mb: 1.5 }}>Accent Color</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {THEME_COLORS.map(color => (
              <Box 
                key={color} 
                onClick={() => setPrimaryColor(color)}
                sx={{ width: 28, height: 28, bgcolor: color, borderRadius: '50%', cursor: 'pointer', border: primaryColor === color ? '2px solid' : '2px solid transparent', borderColor: 'divider' }} 
              />
            ))}
          </Box>
          <SketchPicker color={primaryColor} onChange={c => setPrimaryColor(c.hex)} disableAlpha width={220} presetColors={THEME_COLORS} />
        </Box>
      </Popover>
      <Modal open={showTour} onClose={handleTourClose}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 2, boxShadow: 24, minWidth: 320 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Welcome to Task Manager!</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {tourStep === 0 && 'This is your dashboard. You can add, edit, and organize your tasks and projects.'}
            {tourStep === 1 && 'Use the sidebar to switch projects, customize widgets, and access your profile.'}
            {tourStep === 2 && 'Select multiple tasks for bulk actions, and use the color picker in settings to personalize your experience!'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {tourStep > 0 && <Button onClick={() => setTourStep(tourStep - 1)}>Back</Button>}
            {tourStep < 2 && <Button variant="contained" onClick={() => setTourStep(tourStep + 1)}>Next</Button>}
            {tourStep === 2 && <Button variant="contained" onClick={handleTourClose}>Finish</Button>}
          </Box>
        </Box>
      </Modal>
      
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;