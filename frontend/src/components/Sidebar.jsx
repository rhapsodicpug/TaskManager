import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, ListItem, ListItemButton, Divider, Box, Tooltip, Typography, TextField, Button, IconButton, Collapse, Avatar, LinearProgress, Paper } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ConfirmationDialog from './ConfirmationDialog';
import OverallProgress from './OverallProgress';
import axios from 'axios';
import CustomWidgets from './CustomWidgets';
import { useTheme } from '@mui/material/styles';

const API_URL = 'http://127.0.0.1:8000';
const PROJECT_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'];

function Sidebar({ isOpen, projects, onProjectSelect, selectedProjectId, onProjectsChange, onDeleteProject, isAddingProject, onToggleAddProject, hovered, setHovered }) {
  const theme = useTheme();
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(PROJECT_COLORS[0]);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [projectNameError, setProjectNameError] = useState(false);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      setProjectNameError(true);
      return;
    }
    setProjectNameError(false);
    axios.post(`${API_URL}/projects/`, { name: newProjectName, color: newProjectColor })
      .then(() => {
        onProjectsChange();
        setNewProjectName('');
        setNewProjectColor(PROJECT_COLORS[0]);
      });
  };

  const openDeleteDialog = (project) => { setProjectToDelete(project); };
  const closeDeleteDialog = () => { setProjectToDelete(null); };
  const confirmDeleteProject = () => { onDeleteProject(projectToDelete.id); closeDeleteDialog(); };

  const expanded = isOpen || hovered;
  return (
    <motion.div
      initial={{ width: 72, opacity: 0.95 }}
      animate={{ width: expanded ? 280 : 72, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid',
        borderColor: 'divider',
        background: expanded ? 'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, transparent 100%)' : 'inherit',
        boxShadow: expanded ? '0 2px 16px 0 rgba(0,0,0,0.10)' : '0 1px 4px 0 rgba(0,0,0,0.06)',
        willChange: 'transform, opacity',
      }}
      onMouseEnter={() => { if (!isOpen) setHovered(true); }}
      onMouseLeave={() => { if (!isOpen) setHovered(false); }}
    >
      <OverallProgress projects={projects} isOpen={expanded} />

      <Box sx={{ p: 1, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', minHeight: 0 }}>
        <List>
          <ListItem disablePadding>
            <Tooltip title={!expanded ? 'All Tasks' : ''} placement="right">
              <ListItemButton selected={selectedProjectId === null} onClick={() => onProjectSelect(null)}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: expanded ? 'flex-start' : 'center', width: '100%', px: 1, minWidth: 0 }}>
                  <InboxIcon sx={{ mr: expanded ? 2 : 0, mx: expanded ? undefined : 'auto' }} />
                  {expanded ? (
                    <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>All Tasks</Typography>
                  ) : null}
                </Box>
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
        <Divider sx={{ my: 0.5 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 1, cursor: 'pointer' }} onClick={() => setProjectsExpanded(!projectsExpanded)}>
          {expanded && <Typography variant="overline" color="text.secondary">Projects</Typography>}
          {expanded && <ExpandMoreIcon sx={{ transform: projectsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />}
        </Box>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <Collapse in={projectsExpanded}>
            <List sx={{ pt: 0 }} component={motion.ul} variants={{}} initial="hidden" animate="visible" exit="hidden" transition={{ staggerChildren: 0.07, delayChildren: 0.1 }}>
              <AnimatePresence>
                {projects.map((project) => (
                  <motion.li
                    key={project.id}
                    initial={{ x: -24, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -24, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                    style={{ listStyle: 'none', willChange: 'transform, opacity' }}
                  >
                    <ListItem disablePadding secondaryAction={ expanded && ( <Tooltip title="Delete Project"><IconButton edge="end" size="small" onClick={() => openDeleteDialog(project)}><DeleteIcon fontSize="small" sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }} /></IconButton></Tooltip>) }>
                      <Tooltip title={!expanded ? project.name : ''} placement="right">
                        <ListItemButton selected={selectedProjectId === project.id} onClick={() => onProjectSelect(project.id)}>
                          {/* CORRECTED: justifyContent is now conditional */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: expanded ? 'flex-start' : 'center', width: '100%', px: 1, minWidth: 0 }}>
                            <Avatar sx={{ width: 22, height: 22, bgcolor: project.color, fontSize: '0.75rem', mr: expanded ? 2 : 0, mx: expanded ? undefined : 'auto' }}>{project.name[0].toUpperCase()}</Avatar>
                            {expanded ? (
                              <Typography variant="body2" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.name}</Typography>
                            ) : null}
                          </Box>
                        </ListItemButton>
                      </Tooltip>
                    </ListItem>
                  </motion.li>
                ))}
              </AnimatePresence>
            </List>
          </Collapse>
          {expanded && !isAddingProject && (
            <Button startIcon={<AddIcon />} size="small" onClick={() => { onToggleAddProject(true); setProjectNameError(false); }} sx={{ mt: 1, ml: 1, color: 'text.secondary', textTransform: 'none' }}>New Project</Button>
          )}
          <AnimatePresence>
            {isAddingProject && expanded && (
              <motion.div
                initial={{ y: -24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -24, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              >
                <Divider sx={{ my: 2 }} />
                <Paper elevation={2} sx={{ p: 0, my: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                  <Box sx={{ px: 3, py: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                      Create New Project
                    </Typography>
                    <Box
                      component="form"
                      onSubmit={e => { e.preventDefault(); handleCreateProject(); }}
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
                      onKeyDown={e => {
                        if (e.key === 'Escape') onToggleAddProject(false);
                      }}
                    >
                      <TextField
                        label="Project Name"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={newProjectName}
                        onChange={e => setNewProjectName(e.target.value)}
                        autoFocus
                        error={projectNameError}
                        helperText={projectNameError ? "Name cannot be empty." : ""}
                        sx={{ mb: 1 }}
                      />
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1, justifyContent: 'center' }}>
                        {PROJECT_COLORS.map(color => (
                          <Box
                            key={color}
                            onClick={() => setNewProjectColor(color)}
                            sx={{
                              width: 24,
                              height: 24,
                              minWidth: 24,
                              minHeight: 24,
                              bgcolor: color,
                              borderRadius: '50%',
                              cursor: 'pointer',
                              border: newProjectColor === color ? '2.5px solid' : '2.5px solid transparent',
                              borderColor: newProjectColor === color ? 'primary.main' : 'divider',
                              boxSizing: 'border-box',
                              transition: 'border 0.2s',
                            }}
                          />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                        <Button onClick={() => onToggleAddProject(false)} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained">Add</Button>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>
      {/* Custom Widgets Section - moved outside the main content Box to always be at the bottom */}
      <Box sx={{
        position: 'relative',
        px: 0.5,
        py: 1.5,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'transparent',
        overflow: 'visible',
        zIndex: 1,
        minHeight: 140,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Theme-aware Frosted Glass Blur Effect */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          background:
            theme.palette.mode === 'dark'
              ? 'rgba(30,30,40,0.25)'
              : 'rgba(255,255,255,0.7)',
          border: theme.palette.mode === 'light' ? '1px solid #e0e0e0' : 'none',
          boxShadow:
            theme.palette.mode === 'light'
              ? '0 2px 8px 0 rgba(0,0,0,0.04)'
              : '0 2px 8px 0 rgba(0,0,0,0.12)',
          borderRadius: 0,
          transition: 'backdrop-filter 0.3s, background 0.3s',
        }} />
        <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <CustomWidgets isOpen={expanded} />
        </Box>
      </Box>
      <ConfirmationDialog open={!!projectToDelete} onClose={closeDeleteDialog} onConfirm={confirmDeleteProject} title="Delete Project?" message={`Are you sure you want to delete "${projectToDelete?.name}"? All tasks within this project will also be permanently deleted.`} />
    </motion.div>
  );
}

export default Sidebar;