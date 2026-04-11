import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  IconButton,
  Rating,
  Drawer,
  Divider,
  Switch,
  FormControlLabel,
  Tab,
  Tabs
} from '@mui/material';
import {
  Person as PersonIcon,
  EventNote as EventIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Login as LoginIcon,
  AppRegistration as RegisterIcon
} from '@mui/icons-material';
import { api } from './api';

function App() {
  // Debug panel state
  const [debugOpen, setDebugOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [errorLogs, setErrorLogs] = useState([]);
  const [useMockData, setUseMockData] = useState(true);
  
  // User state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [officeHours, setOfficeHours] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  
  // Auth state
  const [authTab, setAuthTab] = useState(0);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerIme, setRegisterIme] = useState('');
  const [registerPriimek, setRegisterPriimek] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  
  // Dialog states
  const [openOfficeDialog, setOpenOfficeDialog] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [newOfficeHour, setNewOfficeHour] = useState({
    zacetek: '',
    konec: '',
    učilnica: '',
    predmetId: ''
  });

  // Mock uporabniki za debug panel
  const mockUsers = [
    { id: 1, name: "Ana Kovač", email: "student@test.com", roleId: 3, role: "student", password: "password123" },
    { id: 2, name: "Prof. Novak", email: "professor@test.com", roleId: 4, role: "professor", password: "password123" },
    { id: 3, name: "Miha Mlakar", email: "tutor@test.com", roleId: 2, role: "tutor", password: "password123" },
    { id: 4, name: "Admin Admin", email: "admin@test.com", roleId: 1, role: "admin", password: "password123" }
  ];

  // Mock podatki
  const mockSubjectsData = [
    { id: 1, naziv: "Matematika 1", opis: "Osnove matematike" },
    { id: 2, naziv: "Programiranje 1", opis: "Uvod v programiranje" },
    { id: 3, naziv: "Podatkovne baze", opis: "SQL in baze podatkov" }
  ];

  const mockTutorsData = [
    { id: 1, ime: "Miha", priimek: "Novak", email: "miha@student.com", subject: "Programiranje", price: 15, rating: 4.5, reviews: 12 },
    { id: 2, ime: "Petra", priimek: "Horvat", email: "petra@student.com", subject: "Matematika", price: 12, rating: 4.8, reviews: 8 }
  ];

  const mockOfficeHoursData = [
    {
      id: 1,
      zacetek: new Date(Date.now() + 86400000).toISOString(),
      konec: new Date(Date.now() + 90000000).toISOString(),
      učilnica: 101,
      userId: 10,
      uporabnik: { id: 10, ime: "Prof.", priimek: "Novak" },
      predmetId: 1,
      predmet: { id: 1, naziv: "Matematika 1" },
      rezervacije: []
    },
    {
      id: 2,
      zacetek: new Date(Date.now() + 172800000).toISOString(),
      konec: new Date(Date.now() + 176400000).toISOString(),
      učilnica: 203,
      userId: 11,
      uporabnik: { id: 11, ime: "Prof.", priimek: "Horvat" },
      predmetId: 2,
      predmet: { id: 2, naziv: "Programiranje 1" },
      rezervacije: []
    }
  ];

  const addErrorLog = (type, message) => {
    const newLog = {
      id: Date.now(),
      type: type,
      message: message,
      timestamp: new Date().toLocaleTimeString()
    };
    setErrorLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  // Naloži mock podatke
  const loadMockData = () => {
    setSubjects(mockSubjectsData);
    setTutors(mockTutorsData);
    setOfficeHours(mockOfficeHoursData);
    setMyEnrollments([]);
    addErrorLog('success', '✅ Mock podatki naloženi');
  };

  // Mock prijava - BREZ KLICA BACKENDA!
  const handleMockLogin = (mockUser) => {
    const userData = {
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      roleId: mockUser.roleId,
      role: mockUser.role,
    };
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    addErrorLog('success', `🔑 Mock prijava: ${userData.name} (${userData.role})`);
    setSnackbar({ open: true, message: `Prijavljen kot ${userData.name}`, severity: 'success' });
    loadMockData();
  };

  // Prava prijava (če uporabljaš backend)
  const handleLogin = async () => {
    setLoading(true);
    try {
      const userData = await api.login(loginEmail, loginPassword);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      addErrorLog('success', `🔑 Prijava: ${userData.name}`);
      setSnackbar({ open: true, message: `Prijavljen kot ${userData.name}`, severity: 'success' });
      setLoginEmail('');
      setLoginPassword('');
      setLoading(false);
    } catch (error) {
      addErrorLog('error', `❌ Prijava napaka: ${error.message}`);
      setSnackbar({ open: true, message: error.message, severity: 'error' });
      setLoading(false);
    }
  };

  // Registracija
  const handleRegister = async () => {
    if (registerPassword !== registerConfirmPassword) {
      setSnackbar({ open: true, message: 'Gesli se ne ujemata', severity: 'error' });
      return;
    }
    
    setLoading(true);
    try {
      const result = await api.register({
        ime: registerIme,
        priimek: registerPriimek,
        email: registerEmail,
        password: registerPassword,
        rolaId: 3
      });
      
      addErrorLog('success', `✅ Registracija uspešna: ${result.name}`);
      setSnackbar({ open: true, message: 'Registracija uspešna! Zdaj se lahko prijavite.', severity: 'success' });
      setAuthTab(0);
      setRegisterIme('');
      setRegisterPriimek('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
    } catch (error) {
      addErrorLog('error', `❌ Registracija napaka: ${error.message}`);
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    addErrorLog('info', '👋 Odjava uporabnika');
    setSnackbar({ open: true, message: 'Odjavljeni ste', severity: 'info' });
  };

  const handleEnroll = (officeId) => {
    addErrorLog('success', `✅ Prijavljen na termin ${officeId}`);
    setSnackbar({ open: true, message: 'Uspešno prijavljen! (Mock)', severity: 'success' });
  };

  const handleCancelEnrollment = (officeId) => {
    addErrorLog('success', `✅ Preklicana prijava na termin ${officeId}`);
    setSnackbar({ open: true, message: 'Prijava preklicana! (Mock)', severity: 'success' });
  };

  const handleCreateOfficeHour = () => {
    const newOffice = {
      id: officeHours.length + 1,
      zacetek: newOfficeHour.zacetek,
      konec: newOfficeHour.konec || null,
      učilnica: parseInt(newOfficeHour.učilnica),
      userId: user?.id,
      uporabnik: { id: user?.id, ime: user?.name?.split(' ')[0] || '', priimek: user?.name?.split(' ')[1] || '' },
      predmetId: newOfficeHour.predmetId ? parseInt(newOfficeHour.predmetId) : null,
      predmet: subjects.find(s => s.id === parseInt(newOfficeHour.predmetId)),
      rezervacije: []
    };
    setOfficeHours([...officeHours, newOffice]);
    setOpenOfficeDialog(false);
    setNewOfficeHour({ zacetek: '', konec: '', učilnica: '', predmetId: '' });
    addErrorLog('success', '✅ Govorilna ura dodana');
    setSnackbar({ open: true, message: 'Govorilna ura dodana!', severity: 'success' });
  };

  const handleDeleteOfficeHour = (id) => {
    if (window.confirm('Ali ste prepričani?')) {
      setOfficeHours(officeHours.filter(oh => oh.id !== id));
      addErrorLog('success', `🗑️ Govorilna ura ${id} izbrisana`);
      setSnackbar({ open: true, message: 'Govorilna ura izbrisana!', severity: 'success' });
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      loadMockData();
    }
    setLoading(false);
  }, []);

  const getRoleLabel = (roleId) => {
    const roles = { 1: 'admin', 2: 'tutor', 3: 'student', 4: 'professor' };
    return roles[roleId] || 'student';
  };

  const getRoleColor = () => {
    switch (getRoleLabel(user?.roleId)) {
      case 'admin': return '#f44336';
      case 'professor': return '#2196f3';
      case 'tutor': return '#4caf50';
      case 'student': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const getRoleColorByRole = (role) => {
    switch (role) {
      case 'admin': return '#f44336';
      case 'professor': return '#2196f3';
      case 'tutor': return '#4caf50';
      default: return '#ff9800';
    }
  };

  const getStatusIcon = () => {
    if (useMockData) return <WarningIcon sx={{ color: '#ff9800' }} />;
    switch (backendStatus) {
      case 'connected': return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      default: return <ErrorIcon sx={{ color: '#f44336' }} />;
    }
  };

  const getStatusText = () => {
    if (useMockData) return '📦 MOCK način';
    switch (backendStatus) {
      case 'connected': return '✅ Backend povezan';
      default: return '❌ Backend nedosegljiv';
    }
  };

  // Dashboardi
  const StudentDashboard = () => (
    <Box>
      {myEnrollments.length > 0 && (
        <>
          <Typography variant="h5" gutterBottom>🎓 Moje prijave</Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {myEnrollments.map(oh => (
              <Grid item xs={12} md={6} key={oh.id}>
                <Card sx={{ bgcolor: '#e8f5e9' }}>
                  <CardContent>
                    <Typography variant="h6">{oh.predmet?.naziv || 'Brez predmeta'}</Typography>
                    <Typography>👨‍🏫 {oh.uporabnik?.ime} {oh.uporabnik?.priimek}</Typography>
                    <Typography>📅 {new Date(oh.zacetek).toLocaleString()}</Typography>
                    <Typography>📍 Učilnica: {oh.učilnica}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="error" onClick={() => handleCancelEnrollment(oh.id)}>
                      Prekliči prijavo
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <Typography variant="h5" gutterBottom>📖 Razpoložljive govorilne ure</Typography>
      <Grid container spacing={3}>
        {officeHours.map(oh => (
          <Grid item xs={12} md={4} key={oh.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{oh.predmet?.naziv || 'Brez predmeta'}</Typography>
                <Typography color="textSecondary">{oh.uporabnik?.ime} {oh.uporabnik?.priimek}</Typography>
                <Typography>📅 {new Date(oh.zacetek).toLocaleString()}</Typography>
                <Typography>📍 Učilnica: {oh.učilnica}</Typography>
                <Chip label="Prostih: 5" color="success" size="small" sx={{ mt: 1 }} />
              </CardContent>
              <CardActions>
                <Button variant="contained" fullWidth onClick={() => handleEnroll(oh.id)}>
                  Prijavi se
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>👨‍🏫 Tutorji</Typography>
      <Grid container spacing={3}>
        {tutors.map(tutor => (
          <Grid item xs={12} md={4} key={tutor.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{tutor.ime} {tutor.priimek}</Typography>
                <Chip label={tutor.subject || 'Tutor'} size="small" color="primary" sx={{ mb: 1 }} />
                <Typography variant="h6" color="primary">💰 {tutor.price || 15}€/uro</Typography>
                <Rating value={tutor.rating || 4.5} readOnly precision={0.5} size="small" />
              </CardContent>
              <CardActions>
                <Button fullWidth variant="outlined" href={`mailto:${tutor.email}`}>
                  Kontaktiraj
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const ProfessorDashboard = () => (
    <Box>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingOffice(null); setOpenOfficeDialog(true); }} sx={{ mb: 3 }}>
        Dodaj govorilno uro
      </Button>
      <Grid container spacing={3}>
        {officeHours.filter(oh => oh.uporabnik?.id === user?.id).map(oh => (
          <Grid item xs={12} md={6} key={oh.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{oh.predmet?.naziv || 'Brez predmeta'}</Typography>
                <Typography>📅 {new Date(oh.zacetek).toLocaleString()}</Typography>
                <Typography>📍 Učilnica: {oh.učilnica}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<EditIcon />} onClick={() => { setEditingOffice(oh); setOpenOfficeDialog(true); }}>Uredi</Button>
                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteOfficeHour(oh.id)}>Izbriši</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const AdminDashboard = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card><CardContent><Typography variant="h6">📊 Govorilne ure</Typography><Typography variant="h3">{officeHours.length}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card><CardContent><Typography variant="h6">👨‍🏫 Tutorji</Typography><Typography variant="h3">{tutors.length}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card><CardContent><Typography variant="h6">📚 Predmeti</Typography><Typography variant="h3">{subjects.length}</Typography></CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );

  const TutorDashboard = () => (
    <Box>
      <Card sx={{ mb: 3, bgcolor: '#e3f2fd' }}>
        <CardContent>
          <Typography variant="h5">👋 Pozdravljen, {user?.name}!</Typography>
          <Typography>Vaša urna postavka: 15€/uro</Typography>
          <Rating value={4.5} readOnly precision={0.5} />
        </CardContent>
      </Card>
      <Typography variant="h5" gutterBottom>📚 Moje tutorstvo</Typography>
      <Card><CardContent><Typography variant="h6">Programiranje 1</Typography><Typography variant="h6" color="primary">💰 15€/uro</Typography></CardContent></Card>
    </Box>
  );

  const renderDashboard = () => {
    const role = getRoleLabel(user?.roleId);
    switch (role) {
      case 'admin': return <AdminDashboard />;
      case 'professor': return <ProfessorDashboard />;
      case 'tutor': return <TutorDashboard />;
      default: return <StudentDashboard />;
    }
  };

  // Debug Panel
  const DebugPanel = () => (
    <Drawer anchor="left" open={debugOpen} onClose={() => setDebugOpen(false)}>
      <Box sx={{ width: 380, p: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <BugReportIcon /> Debug Panel
        </Typography>
        <Divider />
        
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>📡 Status</Typography>
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {getStatusIcon()}
            <Typography variant="body2">{getStatusText()}</Typography>
          </Box>
          <FormControlLabel
            control={<Switch checked={useMockData} onChange={(e) => { setUseMockData(e.target.checked); if (e.target.checked) loadMockData(); }} />}
            label="Uporabi Mock podatke"
          />
        </Paper>

        <Typography variant="subtitle1" sx={{ mb: 1 }}>👤 Trenutni uporabnik</Typography>
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
          {user ? (
            <>
              <Typography><strong>Ime:</strong> {user.name}</Typography>
              <Typography><strong>Email:</strong> {user.email}</Typography>
              <Typography><strong>Vloga:</strong> {getRoleLabel(user.roleId)}</Typography>
              <Button size="small" color="error" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ mt: 1 }}>Odjava</Button>
            </>
          ) : (
            <Typography color="textSecondary">Ni prijavljenega uporabnika</Typography>
          )}
        </Paper>

        <Typography variant="subtitle1" sx={{ mb: 1 }}>🔑 Mock prijava (hitro testiranje)</Typography>
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
          <Grid container spacing={1}>
            {mockUsers.map(mockUser => (
              <Grid item xs={6} key={mockUser.id}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  size="small" 
                  onClick={() => handleMockLogin(mockUser)} 
                  sx={{ 
                    textTransform: 'none',
                    bgcolor: getRoleColorByRole(mockUser.role) + '20',
                    borderColor: getRoleColorByRole(mockUser.role)
                  }}
                >
                  <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: 12, bgcolor: getRoleColorByRole(mockUser.role) }}>
                    {mockUser.name.charAt(0)}
                  </Avatar>
                  {mockUser.name}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Typography variant="subtitle1" sx={{ mb: 1 }}>📋 Error Log</Typography>
        <Paper variant="outlined" sx={{ p: 1, maxHeight: 300, overflow: 'auto' }}>
          {errorLogs.length === 0 ? (
            <Typography variant="body2" color="textSecondary" align="center">Ni napak</Typography>
          ) : (
            errorLogs.map(log => (
              <Box key={log.id} sx={{ mb: 1, p: 0.5, borderLeft: 3, borderColor: log.type === 'error' ? '#f44336' : log.type === 'success' ? '#4caf50' : '#2196f3', bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">{log.timestamp}</Typography>
                <Typography variant="body2" sx={{ color: log.type === 'error' ? '#f44336' : log.type === 'success' ? '#4caf50' : '#2196f3' }}>{log.message}</Typography>
              </Box>
            ))
          )}
        </Paper>
      </Box>
    </Drawer>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress size={60} />
        <Typography variant="h6">Nalagam aplikacijo...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f0f2f5', py: 4 }}>
        <Card sx={{ maxWidth: 500, width: '100%', p: 3 }}>
          <Typography variant="h4" align="center" gutterBottom>📚 TutorHub</Typography>
          
          <Tabs value={authTab} onChange={(e, v) => setAuthTab(v)} sx={{ mb: 3 }}>
            <Tab icon={<LoginIcon />} label="Prijava" />
            <Tab icon={<RegisterIcon />} label="Registracija" />
          </Tabs>
          
          {authTab === 0 ? (
            <Box>
              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <TextField
                fullWidth
                label="Geslo"
                type="password"
                margin="normal"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <Button fullWidth variant="contained" onClick={handleLogin} disabled={loading} sx={{ mt: 3 }}>
                Prijava
              </Button>
            </Box>
          ) : (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField fullWidth label="Ime" value={registerIme} onChange={(e) => setRegisterIme(e.target.value)} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Priimek" value={registerPriimek} onChange={(e) => setRegisterPriimek(e.target.value)} />
                </Grid>
              </Grid>
              <TextField fullWidth label="Email" type="email" margin="normal" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} />
              <TextField fullWidth label="Geslo" type="password" margin="normal" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} />
              <TextField fullWidth label="Potrdi geslo" type="password" margin="normal" value={registerConfirmPassword} onChange={(e) => setRegisterConfirmPassword(e.target.value)} />
              <Button fullWidth variant="contained" onClick={handleRegister} disabled={loading} sx={{ mt: 3 }}>
                Registracija
              </Button>
            </Box>
          )}
          
          <Divider sx={{ my: 3 }} />
          <Button fullWidth variant="outlined" startIcon={<BugReportIcon />} onClick={() => setDebugOpen(true)}>
            Odpri Debug Panel
          </Button>
          <DebugPanel />
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <IconButton onClick={() => setDebugOpen(true)} sx={{ position: 'fixed', top: 10, left: 10, zIndex: 1300, bgcolor: 'white', boxShadow: 2 }}>
        <BugReportIcon />
      </IconButton>

      <AppBar position="static" sx={{ bgcolor: getRoleColor() }}>
        <Toolbar>
          <EventIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>📚 TutorHub</Typography>
          <Chip
            avatar={<Avatar>{user.name?.charAt(0)}</Avatar>}
            label={`${user.name} (${getRoleLabel(user.roleId)})`}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ bgcolor: 'white', color: getRoleColor() }}
          />
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem>{user.email}</MenuItem>
            <MenuItem onClick={handleLogout}><LogoutIcon sx={{ mr: 1 }} /> Odjava</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {renderDashboard()}
      </Container>

      {/* Dialog za govorilne ure */}
      <Dialog open={openOfficeDialog} onClose={() => { setOpenOfficeDialog(false); setEditingOffice(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingOffice ? 'Uredi govorilno uro' : 'Dodaj govorilno uro'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="datetime-local"
            label="Začetek"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={editingOffice ? editingOffice.zacetek?.slice(0, 16) : newOfficeHour.zacetek}
            onChange={(e) => editingOffice 
              ? setEditingOffice({ ...editingOffice, zacetek: e.target.value })
              : setNewOfficeHour({ ...newOfficeHour, zacetek: e.target.value })
            }
          />
          <TextField
            fullWidth
            type="datetime-local"
            label="Konec (opcijsko)"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={editingOffice ? editingOffice.konec?.slice(0, 16) : newOfficeHour.konec}
            onChange={(e) => editingOffice
              ? setEditingOffice({ ...editingOffice, konec: e.target.value })
              : setNewOfficeHour({ ...newOfficeHour, konec: e.target.value })
            }
          />
          <TextField
            fullWidth
            type="number"
            label="Učilnica"
            margin="normal"
            value={editingOffice ? editingOffice.učilnica : newOfficeHour.učilnica}
            onChange={(e) => editingOffice
              ? setEditingOffice({ ...editingOffice, učilnica: parseInt(e.target.value) })
              : setNewOfficeHour({ ...newOfficeHour, učilnica: e.target.value })
            }
          />
          <TextField
            fullWidth
            select
            label="Predmet"
            margin="normal"
            SelectProps={{ native: true }}
            value={editingOffice ? editingOffice.predmetId || '' : newOfficeHour.predmetId}
            onChange={(e) => editingOffice
              ? setEditingOffice({ ...editingOffice, predmetId: parseInt(e.target.value) || null })
              : setNewOfficeHour({ ...newOfficeHour, predmetId: e.target.value })
            }
          >
            <option value="">Brez predmeta</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.naziv}</option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenOfficeDialog(false); setEditingOffice(null); }}>Prekliči</Button>
          <Button variant="contained" onClick={handleCreateOfficeHour}>
            {editingOffice ? 'Shrani' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      <DebugPanel />
    </Box>
  );
}

export default App;