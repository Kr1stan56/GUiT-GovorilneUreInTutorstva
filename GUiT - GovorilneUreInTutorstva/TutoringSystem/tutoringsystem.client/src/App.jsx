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
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  EventNote as EventIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Login as LoginIcon
} from '@mui/icons-material';

// API BASE URL
const API_BASE_URL = 'http://localhost:5236';

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
  const [newOfficeHour, setNewOfficeHour] = useState({
    zacetek: '',
    konec: '',
    učilnica: '',
    predmetId: ''
  });

  // API klici
  const api = {
    login: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/api/Tutoring/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error('Prijava ni uspela');
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
      setUser(JSON.parse(savedUser));
      loadData();
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
      showMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const userData = await api.login(loginEmail, loginPassword);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setOpenLoginDialog(false);
      await loadData();
      showMessage(`Dobrodošli, ${userData.name}!`, 'success');
    } catch (error) {
      showMessage('Napačen email ali geslo', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setOpenLoginDialog(true);
    showMessage('Uspešno ste se odjavili', 'info');
  };

  const handleCreateOfficeHour = async () => {
    try {
      const newOffice = {
        zacetek: newOfficeHour.zacetek,
        konec: newOfficeHour.konec || null,
        učilnica: parseInt(newOfficeHour.učilnica),
        uporabnikId: user.id,
        predmetId: newOfficeHour.predmetId ? parseInt(newOfficeHour.predmetId) : null
      };
      const created = await api.createOfficeHour(newOffice);
      setOfficeHours([...officeHours, created]);
      setOpenOfficeDialog(false);
      setNewOfficeHour({ zacetek: '', konec: '', učilnica: '', predmetId: '' });
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
    switch (getRoleLabel(user?.roleId)) {
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
                  <TableCell>{oh.učilnica}</TableCell>
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
        {officeHours.filter(oh => oh.uporabnik?.id === user?.id).map(oh => (
          <Grid item xs={12} md={6} key={oh.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{oh.predmet?.naziv || 'Brez predmeta'}</Typography>
                <Typography>📅 {new Date(oh.zacetek).toLocaleString()}</Typography>
                <Typography>📍 Učilnica: {oh.učilnica}</Typography>
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
                <Typography>📍 Učilnica: {oh.učilnica}</Typography>
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
                <Typography variant="h6">{tutor.ime} {tutor.priimek}</Typography>
                <Typography variant="body2">{tutor.email}</Typography>
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

      {/* Login Dialog */}
      <Dialog open={openLoginDialog} onClose={() => {}} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LoginIcon /> Prijava v sistem
          </Box>
        </DialogTitle>
        <DialogContent>
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
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleLogin} fullWidth>
            Prijava
          </Button>
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