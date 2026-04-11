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
  Tab,
  Tabs,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  EventNote as EventIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';

// API BASE URL - spremeni glede na tvoj backend
const API_BASE_URL = 'https://localhost:7101';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [officeHours, setOfficeHours] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [openOfficeDialog, setOpenOfficeDialog] = useState(false);
  const [openLoginDialog, setOpenLoginDialog] = useState(true);
  const [editingOffice, setEditingOffice] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [loginTab, setLoginTab] = useState(0);
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    ime: '',
    priimek: '',
    email: '',
    password: '',
    confirmPassword: '',
    rolaId: 3
  });

  const [newOfficeHour, setNewOfficeHour] = useState({
    zacetek: '',
    konec: '',
    ucilnica: '',
    predmetId: ''
  });

  // API klici z boljšo obdelavo napak
  const api = {
    login: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/api/Tutoring/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        let errorMessage = 'Prijava ni uspela';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch {
          errorMessage = `Napaka: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      return response.json();
    },

    register: async (userData) => {
      const response = await fetch(`${API_BASE_URL}/api/Tutoring/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        let errorMessage = 'Registracija ni uspela';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch {
          errorMessage = `Napaka: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      return response.json();
    },

    getOfficeHours: async () => {
      const response = await fetch(`${API_BASE_URL}/api/Tutoring/officehours`);
      if (!response.ok) throw new Error('Napaka pri nalaganju govorilnih ur');
      return response.json();
    },

    createOfficeHour: async (officeHour) => {
      const response = await fetch(`${API_BASE_URL}/api/Tutoring/officehours`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(officeHour)
      });
      if (!response.ok) throw new Error('Napaka pri ustvarjanju');
      return response.json();
    },

    updateOfficeHour: async (id, officeHour) => {
      const response = await fetch(`${API_BASE_URL}/api/Tutoring/officehours/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(officeHour)
      });
      if (!response.ok) throw new Error('Napaka pri posodabljanju');
      return response.json();
    },

    deleteOfficeHour: async (id) => {
      const response = await fetch(`${API_BASE_URL}/api/Tutoring/officehours/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Napaka pri brisanju');
    },

    getTutors: async () => {
      const response = await fetch(`${API_BASE_URL}/api/Tutoring/tutors`);
      if (!response.ok) throw new Error('Napaka pri nalaganju tutorjev');
      return response.json();
    },

    getSubjects: async () => {
      const response = await fetch(`${API_BASE_URL}/api/Tutoring/subjects`);
      if (!response.ok) throw new Error('Napaka pri nalaganju predmetov');
      return response.json();
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        loadData();
      } catch {
        localStorage.removeItem('user');
        setOpenLoginDialog(true);
        setLoading(false);
      }
    } else {
      setLoading(false);
      setOpenLoginDialog(true);
    }
  }, []);

  const loadData = async () => {
    try {
      const [officeData, tutorData, subjectData] = await Promise.all([
        api.getOfficeHours(),
        api.getTutors(),
        api.getSubjects()
      ]);
      setOfficeHours(officeData);
      setTutors(tutorData);
      setSubjects(subjectData);
    } catch (error) {
      console.error('Load data error:', error);
      showMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      showMessage('Vnesite email in geslo', 'error');
      return;
    }

    try {
      const userData = await api.login(loginEmail, loginPassword);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setOpenLoginDialog(false);
      setLoginEmail('');
      setLoginPassword('');
      await loadData();
      showMessage(`Dobrodošli, ${userData.name}!`, 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const handleRegister = async () => {
    if (!registerData.ime || !registerData.priimek) {
      showMessage('Ime in priimek sta obvezna', 'error');
      return;
    }

    if (!registerData.email || !registerData.email.includes('@')) {
      showMessage('Vnesite veljaven email naslov', 'error');
      return;
    }

    if (!registerData.password || registerData.password.length < 4) {
      showMessage('Geslo mora imeti vsaj 4 znake', 'error');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      showMessage('Gesli se ne ujemata', 'error');
      return;
    }

    try {
      await api.register({
        ime: registerData.ime,
        priimek: registerData.priimek,
        email: registerData.email,
        password: registerData.password,
        rolaId: registerData.rolaId
      });

      showMessage('Registracija uspešna! Zdaj se lahko prijavite.', 'success');
      
      // Počisti formo
      setRegisterData({
        ime: '',
        priimek: '',
        email: '',
        password: '',
        confirmPassword: '',
        rolaId: 3
      });
      
      // Preklopi na prijavo
      setLoginTab(0);
      setLoginEmail(registerData.email);
      
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setOpenLoginDialog(true);
    showMessage('Uspešno ste se odjavili', 'info');
  };

  const handleCreateOfficeHour = async () => {
    if (!newOfficeHour.zacetek || !newOfficeHour.ucilnica) {
      showMessage('Izpolnite vsa obvezna polja', 'error');
      return;
    }

    try {
      const newOffice = {
        zacetek: newOfficeHour.zacetek,
        konec: newOfficeHour.konec || null,
        ucilnica: parseInt(newOfficeHour.ucilnica),
        uporabnikId: user.id,
        predmetId: newOfficeHour.predmetId ? parseInt(newOfficeHour.predmetId) : null
      };
      const created = await api.createOfficeHour(newOffice);
      setOfficeHours([...officeHours, created]);
      setOpenOfficeDialog(false);
      setNewOfficeHour({ zacetek: '', konec: '', ucilnica: '', predmetId: '' });
      showMessage('Govorilna ura uspešno dodana!', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const handleUpdateOfficeHour = async () => {
    try {
      const updated = await api.updateOfficeHour(editingOffice.id, editingOffice);
      setOfficeHours(officeHours.map(oh => oh.id === editingOffice.id ? updated : oh));
      setOpenOfficeDialog(false);
      setEditingOffice(null);
      showMessage('Govorilna ura posodobljena!', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const handleDeleteOfficeHour = async (id) => {
    if (window.confirm('Ali ste prepričani?')) {
      try {
        await api.deleteOfficeHour(id);
        setOfficeHours(officeHours.filter(oh => oh.id !== id));
        showMessage('Govorilna ura izbrisana!', 'success');
      } catch (error) {
        showMessage(error.message, 'error');
      }
    }
  };

  const showMessage = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getRoleLabel = (roleId) => {
    const roles = { 1: 'admin', 2: 'tutor', 3: 'student', 4: 'professor' };
    return roles[roleId] || 'student';
  };

  const getRoleColor = () => {
    const role = getRoleLabel(user?.roleId);
    switch (role) {
      case 'admin': return '#f44336';
      case 'professor': return '#2196f3';
      case 'tutor': return '#4caf50';
      case 'student': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  // Admin Dashboard
  const AdminDashboard = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">📊 Statistika</Typography>
              <Typography>Št. govorilnih ur: {officeHours.length}</Typography>
              <Typography>Št. tutorjev: {tutors.length}</Typography>
              <Typography>Št. predmetov: {subjects.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 3 }}>
        <Typography variant="h5" gutterBottom>Vse govorilne ure</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Predmet</TableCell>
                <TableCell>Profesor</TableCell>
                <TableCell>Učilnica</TableCell>
                <TableCell>Začetek</TableCell>
                <TableCell>Akcije</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {officeHours.map(oh => (
                <TableRow key={oh.id}>
                  <TableCell>{oh.predmet?.naziv || 'Ni določen'}</TableCell>
                  <TableCell>{oh.uporabnik?.ime} {oh.uporabnik?.priimek}</TableCell>
                  <TableCell>{oh.ucilnica}</TableCell>
                  <TableCell>{new Date(oh.zacetek).toLocaleString()}</TableCell>
                  <TableCell>
                    <IconButton color="error" onClick={() => handleDeleteOfficeHour(oh.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );

  // Professor Dashboard
  const ProfessorDashboard = () => (
    <Box>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => { setEditingOffice(null); setOpenOfficeDialog(true); }}
        sx={{ mb: 3 }}
      >
        Dodaj govorilno uro
      </Button>
      <Grid container spacing={3}>
        {officeHours.filter(oh => oh.uporabnik?.id === user.id).map(oh => (
          <Grid item xs={12} md={6} key={oh.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{oh.predmet?.naziv || 'Brez predmeta'}</Typography>
                <Typography>📅 {new Date(oh.zacetek).toLocaleString()}</Typography>
                <Typography>📍 Učilnica: {oh.ucilnica}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<EditIcon />} onClick={() => { setEditingOffice(oh); setOpenOfficeDialog(true); }}>
                  Uredi
                </Button>
                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteOfficeHour(oh.id)}>
                  Izbriši
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Student Dashboard
  const StudentDashboard = () => (
    <Box>
      <Typography variant="h5" gutterBottom>📖 Razpoložljive govorilne ure</Typography>
      <Grid container spacing={3}>
        {officeHours.map(oh => (
          <Grid item xs={12} md={4} key={oh.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{oh.predmet?.naziv || 'Brez predmeta'}</Typography>
                <Typography color="textSecondary">{oh.uporabnik?.ime} {oh.uporabnik?.priimek}</Typography>
                <Typography>📅 {new Date(oh.zacetek).toLocaleString()}</Typography>
                <Typography>📍 Učilnica: {oh.ucilnica}</Typography>
              </CardContent>
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
                <Typography variant="h6">{tutor.name}</Typography>
                <Typography variant="body2">{tutor.email}</Typography>
                <Typography variant="body2" color="textSecondary">{tutor.subject}</Typography>
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

  const renderDashboard = () => {
    const role = getRoleLabel(user?.roleId);
    switch (role) {
      case 'admin': return <AdminDashboard />;
      case 'professor': return <ProfessorDashboard />;
      case 'student': return <StudentDashboard />;
      default: return <StudentDashboard />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {user && (
        <AppBar position="static" sx={{ bgcolor: getRoleColor() }}>
          <Toolbar>
            <EventIcon sx={{ mr: 2 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              📚 TutorHub - Sistem za govorilne ure in tutorstvo
            </Typography>
            <Chip
              avatar={<Avatar><PersonIcon /></Avatar>}
              label={`${user.name} (${getRoleLabel(user.roleId)})`}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ bgcolor: 'white', color: getRoleColor() }}
            />
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem>{user.email}</MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} /> Odjava
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
      )}

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {user ? renderDashboard() : null}
      </Container>

      {/* Login/Register Dialog */}
      <Dialog open={openLoginDialog} onClose={() => {}} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LoginIcon /> Prijava v sistem
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Tabs value={loginTab} onChange={(e, v) => setLoginTab(v)} sx={{ mb: 2 }}>
            <Tab label="Prijava" />
            <Tab label="Registracija" />
          </Tabs>
          
          {loginTab === 0 ? (
            <>
              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              <TextField
                fullWidth
                label="Geslo"
                type="password"
                margin="normal"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              <Button
                fullWidth
                variant="text"
                sx={{ mt: 1 }}
                onClick={() => {
                  setLoginTab(1);
                }}
              >
                Nimate računa? Registrirajte se
              </Button>
            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="Ime"
                margin="normal"
                value={registerData.ime}
                onChange={(e) => setRegisterData({ ...registerData, ime: e.target.value })}
              />
              <TextField
                fullWidth
                label="Priimek"
                margin="normal"
                value={registerData.priimek}
                onChange={(e) => setRegisterData({ ...registerData, priimek: e.target.value })}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              />
              <TextField
                fullWidth
                label="Geslo"
                type="password"
                margin="normal"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                helperText="Geslo mora imeti vsaj 4 znake"
              />
              <TextField
                fullWidth
                label="Ponovi geslo"
                type="password"
                margin="normal"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
              />
              <TextField
                fullWidth
                select
                label="Vloga"
                margin="normal"
                SelectProps={{ native: true }}
                value={registerData.rolaId}
                onChange={(e) => setRegisterData({ ...registerData, rolaId: parseInt(e.target.value) })}
              >
                <option value={3}>Študent</option>
                <option value={2}>Tutor</option>
                <option value={4}>Profesor</option>
              </TextField>
              <Button
                fullWidth
                variant="text"
                sx={{ mt: 1 }}
                onClick={() => setLoginTab(0)}
              >
                Že imate račun? Prijavite se
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {loginTab === 0 ? (
            <Button variant="contained" onClick={handleLogin} fullWidth>
              Prijava
            </Button>
          ) : (
            <Button variant="contained" onClick={handleRegister} fullWidth>
              Registracija
            </Button>
          )}
        </DialogActions>
      </Dialog>

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
            value={editingOffice ? editingOffice.ucilnica : newOfficeHour.ucilnica}
            onChange={(e) => editingOffice
              ? setEditingOffice({ ...editingOffice, ucilnica: parseInt(e.target.value) })
              : setNewOfficeHour({ ...newOfficeHour, ucilnica: e.target.value })
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
          <Button variant="contained" onClick={editingOffice ? handleUpdateOfficeHour : handleCreateOfficeHour}>
            {editingOffice ? 'Shrani spremembe' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default App;