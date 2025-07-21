import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AppBar, Toolbar, Typography, IconButton, useTheme, Badge, Avatar, Popover, Box, TextField, Button, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PaletteIcon from '@mui/icons-material/Palette';
import NotificationsIcon from '@mui/icons-material/Notifications';

function stringToColor(string) {
  let hash = 0;
  let i;
  for (i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).slice(-2);
  }
  return color;
}

const SIDEBAR_WIDTH = 280;

function Header({ onMenuClick, onToggleTheme, onSettingsClick, notificationCount, onNotificationClick, isSidebarOpen, isDesktop }) {
  const theme = useTheme();
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [name, setName] = useState(() => localStorage.getItem('profileName') || 'User');
  const [editName, setEditName] = useState(name);
  const avatarRef = useRef();
  const [avatarImg, setAvatarImg] = useState(() => localStorage.getItem('profileAvatar') || '');

  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };
  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };
  const handleNameSave = () => {
    setName(editName);
    localStorage.setItem('profileName', editName);
    handleProfileClose();
  };
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarImg(ev.target.result);
        localStorage.setItem('profileAvatar', ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleAvatarRemove = () => {
    setAvatarImg('');
    localStorage.removeItem('profileAvatar');
  };
  const open = Boolean(profileAnchorEl);

  return (
    <motion.div
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
    >
    <AppBar 
      position="fixed" 
      sx={{ 
        color: 'text.primary',
        width: { lg: `calc(100% - ${(isSidebarOpen && isDesktop) ? 280 : (isDesktop ? 72 : 0)}px)` },
        ml: { lg: `${(isSidebarOpen && isDesktop) ? 280 : (isDesktop ? 72 : 0)}px` },
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={onMenuClick} sx={{ mr: 1 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Task Manager
        </Typography>
        <motion.div whileHover={{ scale: 1.15 }} style={{ display: 'inline-block' }}>
          <IconButton sx={{ ml: 1 }} onClick={onToggleTheme} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </motion.div>
        <motion.div whileHover={{ scale: 1.15 }} style={{ display: 'inline-block' }}>
          <IconButton color="inherit" onClick={onNotificationClick}>
            <Badge badgeContent={notificationCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </motion.div>
        <motion.div whileHover={{ scale: 1.15 }} style={{ display: 'inline-block' }}>
          <IconButton color="inherit" onClick={onSettingsClick}>
            <PaletteIcon />
          </IconButton>
        </motion.div>
        <IconButton color="inherit" ref={avatarRef} onClick={handleProfileClick} sx={{ ml: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: stringToColor(name) }} src={avatarImg || undefined}>
            {!avatarImg && name[0]}
          </Avatar>
        </IconButton>
        <Popover
          open={open}
          anchorEl={profileAnchorEl}
          onClose={handleProfileClose}
          PaperProps={{
            component: motion.div,
            initial: { scale: 0.85, opacity: 0 },
            animate: { scale: 1.04, opacity: 1 },
            exit: { scale: 0.85, opacity: 0 },
            transition: { type: 'spring', stiffness: 180, damping: 14, mass: 0.7 },
            style: { boxShadow: '0 8px 32px 0 rgba(138,114,255,0.13)' }
          }}
          BackdropProps={{
            className: 'mui-modal-overlay'
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ p: 2, minWidth: 220 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ width: 48, height: 48, bgcolor: stringToColor(name), mr: 2 }} src={avatarImg || undefined}>
                {!avatarImg && name[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">{name}</Typography>
                <Typography variant="caption" color="text.secondary">Profile</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Button component="label" size="small" variant="outlined" sx={{ mr: 1 }}>
                Upload Photo
                <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
              </Button>
              {avatarImg && (
                <Button size="small" color="error" variant="outlined" onClick={handleAvatarRemove}>Remove</Button>
              )}
            </Box>
            <TextField
              label="Name"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button variant="contained" size="small" onClick={handleNameSave} fullWidth>Save</Button>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Theme</Typography>
            <Button variant="outlined" size="small" onClick={onToggleTheme} fullWidth>
              {theme.palette.mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </Button>
          </Box>
        </Popover>
      </Toolbar>
    </AppBar>
    </motion.div>
  );
}
export default Header;