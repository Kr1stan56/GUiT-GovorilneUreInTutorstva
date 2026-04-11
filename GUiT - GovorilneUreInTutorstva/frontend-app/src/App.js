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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Rating,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  EventNote as EventIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Dashboard as DashboardIcon,
  Book as BookIcon,
  Logout as LogoutIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { api } from './api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [officeHours, setOfficeHours] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [openOfficeDialog, setOpenOfficeDialog] = useState(false);
  const [openTutorDialog, setOpenTutorDialog] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);
  const [editingTutor, setEditingTutor] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Form state
  const [officeForm, setOfficeForm] = useState({
    professorName: '',
    professorId: 0,
    subject: '',
    dateTime: '',
    location: '',
    maxStudents: 5,
    enrolled: 0,
    students: []
  });
  
  const [tutorForm, setTutorForm] = useState({
    name: '',
    studentId: 0,
    subject: '',
    description: '',
    price: 15,
    email: '',
    rating: 0,
    reviews: 0
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Za demo namene uporabimo mock prijavo
      // Kasneje zamenjajte s pravim loginom
      const mockUser = { id: 4, name: "Ana K.", role: "student", email: "ana@student.com" };
      setUser(mockUser);
      
      const [officeData, tutorData] = await Promise.all([
        api.getOfficeHours(),
        api.getTutors()
      ]);
      setOfficeHours(officeData);
      setTutors(tutorData);
    } catch (error) {
      console.error('Napaka pri nalaganju:', error);
      showMessage('Napaka pri povezavi s strežnikom', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleEnroll = async (officeId) => {
    if (user.role !== 'student') return;
    
    try {
      const updated = await api.enrollStudent(officeId, user.id);
      setOfficeHours(officeHours.map(oh => oh.id === officeId ? updated : oh));
      showMessage('Uspešno ste se prijavili na govorilno uro!');
    } catch (error) {
      showMessage('Napaka pri prijavi', 'error');
    }
  };

  const handleCancelEnrollment = async (officeId) => {
    try {
      const updated = await api.cancelEnrollment(officeId, user.id);
      setOfficeHours(officeHours.map(oh => oh.id === officeId ? updated : oh));
      showMessage('Prijava je bila preklicana.');
    } catch (error) {
      showMessage('Napaka pri preklicu', 'error');
    }
  };

  const handleDeleteOffice = async (id) => {
    try {
      await api.deleteOfficeHour(id);
      setOfficeHours(officeHours.filter(oh => oh.id !== id));
      showMessage('Govorilna ura je izbrisana.');
    } catch (error) {
      showMessage('Napaka pri brisanju', 'error');
    }
  };

  const handleCreateOffice = async () => {
    try {
      const newOffice = await api.createOfficeHour({
        ...officeForm,
        professorId: user.id,
        professorName: user.name,
        enrolled: 0,
        students: []
      });
      setOfficeHours([...officeHours, newOffice]);
      setOpenOfficeDialog(false);
      setOfficeForm({
        professorName: '',
        professorId: 0,
        subject: '',
        dateTime: '',
        location: '',
        maxStudents: 5,
        enrolled: 0,
        students: []
      });
      showMessage('Govorilna ura je dodana!');
    } catch (error) {
      showMessage('Napaka pri dodajanju', 'error');
    }
  };

  const handleUpdateOffice = async () => {
    try {
      const updated = await api.updateOfficeHour(editingOffice.id, officeForm);
      setOfficeHours(officeHours.map(oh => oh.id === editingOffice.id ? updated : oh));
      setOpenOfficeDialog(false);
      setEditingOffice(null);
      showMessage('Govorilna ura je posodobljena!');
    } catch (error) {
      showMessage('Napaka pri posodabljanju', 'error');
    }
  };

  const handleUpdateTutor = async () => {
    try {
      const updated = await api.updateTutor(editingTutor.id, tutorForm);
      setTutors(tutors.map(t => t.id === editingTutor.id ? updated : t));
      setOpenTutorDialog(false);
      setEditingTutor(null);
      showMessage('Profil je posodobljen!');
    } catch (error) {
      showMessage('Napaka pri posodabljanju', 'error');
    }
  };

  const isEnrolled = (officeId) => {
    const office = officeHours.find(oh => oh.id === officeId);
    return office?.students?.includes(user?.id);
  };

  // Admin view
  const AdminDashboard = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">📊 Statistika</Typography>
              <Typography>Št. govorilnih ur: {officeHours.length}</Typography>
              <Typography>Št. tutorjev: {tutors.length}</Typography>
              <Typography>Skupaj prijav: {officeHours.reduce((sum, oh) => sum + oh.enrolled, 0)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">👥 Uporabniki</Typography>
              <Typography>Študentov: 45</Typography>
              <Typography>Profesorjev: 8</Typography>
              <Typography>Tutorjev: {tutors.length}</Typography>
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
                <TableCell>Datum</TableCell>
                <TableCell>Prijavljeni</TableCell>
                <TableCell>Akcije</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {officeHours.map(oh => (
                <TableRow key={oh.id}>
                  <TableCell>{oh.subject}</TableCell>
                  <TableCell>{oh.professorName}</TableCell>
                  <TableCell>{new Date(oh.dateTime).toLocaleString()}</TableCell>
                  <TableCell>{oh.enrolled}/{oh.maxStudents}</TableCell>
                  <TableCell>
                    <IconButton color="error" onClick={() => handleDeleteOffice(oh.id)}>
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

  // Professor view
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
        {officeHours.filter(oh => oh.professorId === user.id).map(oh => (
          <Grid item xs={12} md={6} key={oh.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{oh.subject}</Typography>
                <Chip label={oh.location} size="small" sx={{ mb: 1 }} />
                <Typography>📅 {new Date(oh.dateTime).toLocaleString()}</Typography>
                <Typography>👥 Prijavljeni: {oh.enrolled}/{oh.maxStudents}</Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Prijavljeni študenti: {oh.students?.length || 0}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<EditIcon />} onClick={() => { 
                  setEditingOffice(oh); 
                  setOfficeForm(oh);
                  setOpenOfficeDialog(true); 
                }}>
                  Uredi
                </Button>
                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteOffice(oh.id)}>
                  Izbriši
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Tutor view
  const TutorDashboard = () => {
    const myTutorProfile = tutors.find(t => t.studentId === user.id);
    return (
      <Box>
        <Card sx={{ mb: 3, bgcolor: '#e3f2fd' }}>
          <CardContent>
            <Typography variant="h5">👋 Pozdravljen, {user.name}!</Typography>
            <Typography>Vaša urna postavka: {myTutorProfile?.price || 15}€/uro</Typography>
            <Rating value={myTutorProfile?.rating || 0} readOnly precision={0.5} />
          </CardContent>
        </Card>
        <Button variant="contained" startIcon={<EditIcon />} onClick={() => {
          if (myTutorProfile) {
            setEditingTutor(myTutorProfile);
            setTutorForm(myTutorProfile);
            setOpenTutorDialog(true);
          }
        }} sx={{ mb: 3 }}>
          Uredi svoj profil
        </Button>
        <Typography variant="h5" gutterBottom>📚 Moje tutorstvo</Typography>
        <Grid container spacing={3}>
          {tutors.filter(t => t.studentId === user.id).map(tutor => (
            <Grid item xs={12} key={tutor.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{tutor.subject}</Typography>
                  <Typography>{tutor.description}</Typography>
                  <Typography variant="h6" color="primary">💰 {tutor.price}€/uro</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Student view
  const StudentDashboard = () => (
    <Box>
      <Typography variant="h5" gutterBottom>🎓 Moje prijave</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {officeHours.filter(oh => oh.students?.includes(user.id)).map(oh => (
          <Grid item xs={12} md={6} key={oh.id}>
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography variant="h6">{oh.subject}</Typography>
                <Typography>👨‍🏫 {oh.professorName}</Typography>
                <Typography>📅 {new Date(oh.dateTime).toLocaleString()}</Typography>
                <Typography>📍 {oh.location}</Typography>
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

      <Typography variant="h5" gutterBottom>📖 Razpoložljive govorilne ure</Typography>
      <Grid container spacing={3}>
        {officeHours.filter(oh => !oh.students?.includes(user.id) && oh.enrolled < oh.maxStudents).map(oh => (
          <Grid item xs={12} md={4} key={oh.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{oh.subject}</Typography>
                <Typography color="textSecondary">{oh.professorName}</Typography>
                <Typography>📅 {new Date(oh.dateTime).toLocaleString()}</Typography>
                <Typography>📍 {oh.location}</Typography>
                <Chip label={`Prostih: ${oh.maxStudents - oh.enrolled}`} color="success" size="small" sx={{ mt: 1 }} />
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

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>👨‍🏫 Razpoložljivi tutorji</Typography>
      <Grid container spacing={3}>
        {tutors.map(tutor => (
          <Grid item xs={12} md={4} key={tutor.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{tutor.name}</Typography>
                <Chip label={tutor.subject} size="small" color="primary" sx={{ mb: 1 }} />
                <Typography variant="body2">{tutor.description}</Typography>
                <Typography variant="h6" color="primary">💰 {tutor.price}€/uro</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Rating value={tutor.rating} readOnly precision={0.5} size="small" />
                  <Typography variant="body2" sx={{ ml: 1 }}>({tutor.reviews})</Typography>
                </Box>
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
    switch (user?.role) {
      case 'admin': return <AdminDashboard />;
      case 'professor': return <ProfessorDashboard />;
      case 'tutor': return <TutorDashboard />;
      case 'student': return <StudentDashboard />;
      default: return <StudentDashboard />;
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin': return <DashboardIcon />;
      case 'professor': return <SchoolIcon />;
      case 'tutor': return <PersonIcon />;
      case 'student': return <BookIcon />;
      default: return <PersonIcon />;
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin': return '#f44336';
      case 'professor': return '#2196f3';
      case 'tutor': return '#4caf50';
      case 'student': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: getRoleColor() }}>
        <Toolbar>
          <EventIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            📚 TutorHub - Sistem za govorilne ure in tutorstvo
          </Typography>
          <Chip
            avatar={<Avatar>{getRoleIcon()}</Avatar>}
            label={`${user.name} (${user.role})`}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ bgcolor: 'white', color: getRoleColor() }}
          />
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem>{user.email}</MenuItem>
            <MenuItem onClick={() => showMessage('Odjava funkcionalnost bo dodana')}>
              <LogoutIcon sx={{ mr: 1 }} /> Odjava
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {renderDashboard()}
      </Container>

      {/* Dialog za dodajanje/urejanje govorilnih ur */}
      <Dialog open={openOfficeDialog} onClose={() => setOpenOfficeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingOffice ? 'Uredi govorilno uro' : 'Dodaj govorilno uro'}</DialogTitle>
        <DialogContent>
          <TextField 
            fullWidth 
            label="Predmet" 
            margin="normal" 
            value={officeForm.subject}
            onChange={(e) => setOfficeForm({...officeForm, subject: e.target.value})}
          />
          <TextField 
            fullWidth 
            label="Lokacija" 
            margin="normal"
            value={officeForm.location}
            onChange={(e) => setOfficeForm({...officeForm, location: e.target.value})}
          />
          <TextField 
            fullWidth 
            type="datetime-local" 
            label="Datum in čas" 
            margin="normal" 
            InputLabelProps={{ shrink: true }}
            value={officeForm.dateTime}
            onChange={(e) => setOfficeForm({...officeForm, dateTime: e.target.value})}
          />
          <TextField 
            fullWidth 
            type="number" 
            label="Max študentov" 
            margin="normal"
            value={officeForm.maxStudents}
            onChange={(e) => setOfficeForm({...officeForm, maxStudents: parseInt(e.target.value)})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOfficeDialog(false)}>Prekliči</Button>
          <Button variant="contained" onClick={editingOffice ? handleUpdateOffice : handleCreateOffice}>
            Shrani
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog za urejanje tutorski profila */}
      <Dialog open={openTutorDialog} onClose={() => setOpenTutorDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Uredi tutorski profil</DialogTitle>
        <DialogContent>
          <TextField 
            fullWidth 
            label="Opis" 
            multiline 
            rows={3} 
            margin="normal"
            value={tutorForm.description}
            onChange={(e) => setTutorForm({...tutorForm, description: e.target.value})}
          />
          <TextField 
            fullWidth 
            type="number" 
            label="Cena (€/uro)" 
            margin="normal"
            value={tutorForm.price}
            onChange={(e) => setTutorForm({...tutorForm, price: parseFloat(e.target.value)})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTutorDialog(false)}>Prekliči</Button>
          <Button variant="contained" onClick={handleUpdateTutor}>Shrani</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default App;