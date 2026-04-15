import { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Grid, Card, CardContent, CardActions,
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Box, Chip,
  Avatar, Menu, MenuItem, Alert, Snackbar, CircularProgress, Paper, IconButton,
  Rating, Drawer, Divider, Switch, FormControlLabel, Tab, Tabs, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Select, InputLabel, FormControl,
  Accordion, AccordionSummary, AccordionDetails, InputAdornment
} from '@mui/material';
import {
  EventNote as EventIcon, Edit as EditIcon, Delete as DeleteIcon,
  Logout as LogoutIcon, Add as AddIcon, BugReport as BugReportIcon, CheckCircle as CheckCircleIcon,
  Error as ErrorIcon, Refresh as RefreshIcon, Warning as WarningIcon, Login as LoginIcon,
  AppRegistration as RegisterIcon, ExpandMore as ExpandMoreIcon, Comment as CommentIcon,
  SwapHoriz as SwapHorizIcon, Search as SearchIcon
} from '@mui/icons-material';
import { api } from './api';

function App() {
  // Debug panel state – dostopen SAMO adminu
  const [debugOpen, setDebugOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [errorLogs, setErrorLogs] = useState([]);
  const [useMockData, setUseMockData] = useState(false);
  const [expandedError, setExpandedError] = useState(null);

  // User state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [officeHours, setOfficeHours] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);

  // Tutor specific state
  const [tutorSubjects, setTutorSubjects] = useState([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [selectedOfficeHour, setSelectedOfficeHour] = useState(null);
  const [reservationsForOffice, setReservationsForOffice] = useState([]);
  const [openReservationsDialog, setOpenReservationsDialog] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);

  // Admin specific state
  const [allUsers, setAllUsers] = useState([]);
  const [impersonatedUser, setImpersonatedUser] = useState(null);
  const [allOfficeHours, setAllOfficeHours] = useState([]);

  // Student filtering/sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');

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
    zacetek: '', konec: '', učilnica: '', predmetId: ''
  });

  // Mock podatki (samo za debug)
  const mockUsers = [
    { id: 1, name: "Ana Kovač", email: "student@test.com", roleId: 3, role: "student", password: "password123" },
    { id: 2, name: "Prof. Novak", email: "professor@test.com", roleId: 4, role: "professor", password: "password123" },
    { id: 3, name: "Miha Mlakar", email: "tutor@test.com", roleId: 2, role: "tutor", password: "password123" },
    { id: 4, name: "Admin Admin", email: "admin@test.com", roleId: 1, role: "admin", password: "password123" }
  ];

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
      id: 1, zacetek: new Date(Date.now() + 86400000).toISOString(), konec: new Date(Date.now() + 90000000).toISOString(),
      učilnica: "101", uporabnik_id: 10, uporabnik: { id: 10, ime: "Prof.", priimek: "Novak" }, predmet_id: 1,
      predmet: { id: 1, naziv: "Matematika 1" }, rezervacije: [], komentarUcitelja: ""
    },
    {
      id: 2, zacetek: new Date(Date.now() + 172800000).toISOString(), konec: new Date(Date.now() + 176400000).toISOString(),
      učilnica: "203", uporabnik_id: 11, uporabnik: { id: 11, ime: "Prof.", priimek: "Horvat" }, predmet_id: 2,
      predmet: { id: 2, naziv: "Programiranje 1" }, rezervacije: [], komentarUcitelja: ""
    }
  ];

  const addErrorLog = (type, message, details = null) => {
    const newLog = {
      id: Date.now(),
      type,
      message,
      details: details ? JSON.stringify(details, null, 2) : null,
      timestamp: new Date().toLocaleTimeString()
    };
    setErrorLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const showError = (userMessage, technicalError) => {
    setSnackbar({ open: true, message: userMessage || "Napaka, obrnite se na administratorja", severity: 'error' });
    addErrorLog('error', technicalError.message || technicalError, technicalError);
  };

  // Nalaganje podatkov (mock ali real)
  const loadMockData = () => {
    setSubjects(mockSubjectsData);
    setTutors(mockTutorsData);
    setOfficeHours(mockOfficeHoursData);
    setAllOfficeHours(mockOfficeHoursData);
    setMyEnrollments([]);
    if (user?.roleId === 2) {
      setTutorSubjects([mockSubjectsData[1]]);
      setHourlyRate('15');
    }
    if (user?.roleId === 1) {
      setAllUsers(mockUsers.map(u => ({ id: u.id, ime: u.name.split(' ')[0], priimek: u.name.split(' ')[1] || '', email: u.email, roleId: u.roleId, urnaPostavka: u.roleId === 2 ? 15 : null })));
    }
    addErrorLog('success', '✅ Mock podatki naloženi');
  };

  const loadRealData = async () => {
    try {
      const [officeData, tutorData, subjectData, usersData] = await Promise.all([
        api.getOfficeHours(),
        api.getTutors(),
        api.getSubjects(),
        user?.roleId === 1 ? api.getAllUsers() : Promise.resolve([])
      ]);
      setOfficeHours(officeData);
      setAllOfficeHours(officeData);
      setTutors(tutorData);
      setSubjects(subjectData);
      if (user) {
        const enrollments = await api.getMyEnrollments(user.id);
        setMyEnrollments(enrollments);
        if (user.roleId === 2) {
          const subjectsTaught = await api.getTutorSubjects(user.id);
          setTutorSubjects(subjectsTaught);
          setHourlyRate(user.urnaPostavka?.toString() || '15');
        }
        if (user.roleId === 1) {
          setAllUsers(usersData);
        }
      }
      addErrorLog('success', '✅ Podatki naloženi iz backenda');
    } catch (error) {
      showError('Napaka pri nalaganju podatkov', error);
      throw error;
    }
  };

  const loadData = async () => {
    setLoading(true);
    if (useMockData) {
      loadMockData();
    } else {
      try {
        await loadRealData();
        setBackendStatus('connected');
      } catch {
        setBackendStatus('error');
      }
    }
    setLoading(false);
  };

  // Mock prijava
  const handleMockLogin = (mockUser) => {
    const userData = {
      id: mockUser.id, name: mockUser.name, email: mockUser.email,
      roleId: mockUser.roleId, role: mockUser.role, urnaPostavka: mockUser.roleId === 2 ? 15 : null
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    addErrorLog('success', `🔑 Mock prijava: ${userData.name} (${userData.role})`);
    setSnackbar({ open: true, message: `Prijavljen kot ${userData.name}`, severity: 'success' });
    loadData();
  };

  // Prava prijava
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
      await loadData();
    } catch (error) {
      showError('Prijava ni uspela', error);
    } finally {
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
        ime: registerIme, priimek: registerPriimek, email: registerEmail,
        password: registerPassword, rolaId: 3
      });
      addErrorLog('success', `✅ Registracija uspešna: ${result.name}`);
      setSnackbar({ open: true, message: 'Registracija uspešna! Zdaj se lahko prijavite.', severity: 'success' });
      setAuthTab(0);
      setRegisterIme(''); setRegisterPriimek(''); setRegisterEmail('');
      setRegisterPassword(''); setRegisterConfirmPassword('');
    } catch (error) {
      showError('Registracija ni uspela', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setImpersonatedUser(null);
    localStorage.removeItem('user');
    addErrorLog('info', '👋 Odjava uporabnika');
    setSnackbar({ open: true, message: 'Odjavljeni ste', severity: 'info' });
  };

  // Prijava na govorilno uro
  const handleEnroll = async (officeId) => {
    if (!user) return;
    try {
      if (useMockData) {
        addErrorLog('success', `✅ Prijavljen na termin ${officeId} (mock)`);
        setSnackbar({ open: true, message: 'Uspešno prijavljen! (Mock)', severity: 'success' });
        const office = officeHours.find(oh => oh.id === officeId);
        if (office && !myEnrollments.some(e => e.id === officeId)) {
          setMyEnrollments([...myEnrollments, office]);
        }
      } else {
        await api.enrollStudent(officeId, user.id);
        await loadRealData();
        setSnackbar({ open: true, message: 'Uspešno prijavljen!', severity: 'success' });
      }
    } catch (error) {
      showError('Napaka pri prijavi na govorilno uro', error);
    }
  };

  // Preklic prijave
  const handleCancelEnrollment = async (officeId) => {
    if (!user) return;
    try {
      if (useMockData) {
        addErrorLog('success', `✅ Preklicana prijava na termin ${officeId} (mock)`);
        setSnackbar({ open: true, message: 'Prijava preklicana! (Mock)', severity: 'success' });
        setMyEnrollments(myEnrollments.filter(e => e.id !== officeId));
      } else {
        await api.cancelEnrollment(officeId, user.id);
        await loadRealData();
        setSnackbar({ open: true, message: 'Prijava preklicana!', severity: 'success' });
      }
    } catch (error) {
      showError('Napaka pri preklicu prijave', error);
    }
  };

  // Ustvari govorilno uro – popravljeno za preprečitev preteklega datuma
  const handleCreateOfficeHour = async () => {
    if (!user) return;
    
    // Preveri, če je začetek prazen
    if (!newOfficeHour.zacetek) {
      setSnackbar({ open: true, message: 'Izberite začetek ure!', severity: 'error' });
      return;
    }
    
    // Ustvari Date objekt iz lokalnega datetime-local stringa (YYYY-MM-DDThh:mm)
    // Ta string je v lokalnem času uporabnika.
    let startDate = new Date(newOfficeHour.zacetek);
    let now = new Date();
    
    // Preveri, ali je izbrani datum v preteklosti (primerjaj po minutah)
    if (startDate <= now) {
      setSnackbar({ open: true, message: 'Začetek ure ne more biti v preteklosti! Izberite prihodnji datum in čas.', severity: 'error' });
      return;
    }
    
    // Pretvori v UTC ISO string (backend pričakuje UTC)
    const startUTC = startDate.toISOString();
    let endUTC = null;
    if (newOfficeHour.konec) {
      let endDate = new Date(newOfficeHour.konec);
      if (endDate <= startDate) {
        setSnackbar({ open: true, message: 'Konec ure mora biti po začetku!', severity: 'error' });
        return;
      }
      endUTC = endDate.toISOString();
    }
    
    const data = {
      zacetek: startUTC,
      konec: endUTC,
      učilnica: newOfficeHour.učilnica,
      uporabnik_id: user.id,
      predmet_id: newOfficeHour.predmetId ? parseInt(newOfficeHour.predmetId) : null
    };
    
    if (useMockData) {
      const newOffice = {
        ...data, id: officeHours.length + 1,
        uporabnik: { id: user.id, ime: user.name.split(' ')[0], priimek: user.name.split(' ')[1] || '' },
        predmet: subjects.find(s => s.id === data.predmet_id),
        rezervacije: [], komentarUcitelja: ""
      };
      setOfficeHours([...officeHours, newOffice]);
      setAllOfficeHours([...allOfficeHours, newOffice]);
      addErrorLog('success', '✅ Govorilna ura dodana (mock)');
      setSnackbar({ open: true, message: 'Govorilna ura dodana!', severity: 'success' });
      setOpenOfficeDialog(false);
      setNewOfficeHour({ zacetek: '', konec: '', učilnica: '', predmetId: '' });
    } else {
      try {
        await api.createOfficeHour(data);
        await loadRealData();
        setSnackbar({ open: true, message: 'Govorilna ura dodana!', severity: 'success' });
        setOpenOfficeDialog(false);
        setNewOfficeHour({ zacetek: '', konec: '', učilnica: '', predmetId: '' });
      } catch (error) {
        showError('Napaka pri dodajanju govorilne ure', error);
      }
    }
  };

  // Posodobi govorilno uro
  const handleUpdateOfficeHour = async () => {
    if (!user || !editingOffice) return;
    const data = {
      zacetek: editingOffice.zacetek,
      konec: editingOffice.konec || null,
      učilnica: editingOffice.učilnica,
      uporabnik_id: user.id,
      predmet_id: editingOffice.predmet_id ? parseInt(editingOffice.predmet_id) : null
    };
    if (useMockData) {
      setOfficeHours(officeHours.map(oh => oh.id === editingOffice.id ? { ...oh, ...data } : oh));
      setAllOfficeHours(allOfficeHours.map(oh => oh.id === editingOffice.id ? { ...oh, ...data } : oh));
      addErrorLog('success', `✅ Govorilna ura ${editingOffice.id} posodobljena (mock)`);
      setSnackbar({ open: true, message: 'Govorilna ura posodobljena!', severity: 'success' });
      setOpenOfficeDialog(false);
      setEditingOffice(null);
    } else {
      try {
        await api.updateOfficeHour(editingOffice.id, data);
        await loadRealData();
        setSnackbar({ open: true, message: 'Govorilna ura posodobljena!', severity: 'success' });
        setOpenOfficeDialog(false);
        setEditingOffice(null);
      } catch (error) {
        showError('Napaka pri posodabljanju govorilne ure', error);
      }
    }
  };

  const handleDeleteOfficeHour = async (id) => {
    if (!window.confirm('Ali ste prepričani?')) return;
    if (useMockData) {
      setOfficeHours(officeHours.filter(oh => oh.id !== id));
      setAllOfficeHours(allOfficeHours.filter(oh => oh.id !== id));
      addErrorLog('success', `🗑️ Govorilna ura ${id} izbrisana (mock)`);
      setSnackbar({ open: true, message: 'Govorilna ura izbrisana!', severity: 'success' });
    } else {
      try {
        await api.deleteOfficeHour(id);
        await loadRealData();
        setSnackbar({ open: true, message: 'Govorilna ura izbrisana!', severity: 'success' });
      } catch (error) {
        showError('Napaka pri brisanju govorilne ure', error);
      }
    }
  };

  // Tutor: posodobi urno postavko
  const handleUpdateHourlyRate = async () => {
    if (useMockData) {
      setSnackbar({ open: true, message: `Urna postavka posodobljena na ${hourlyRate}€ (mock)`, severity: 'success' });
      addErrorLog('success', `Urna postavka posodobljena na ${hourlyRate}€ (mock)`);
    } else {
      try {
        await api.updateHourlyRate(user.id, parseFloat(hourlyRate));
        setSnackbar({ open: true, message: 'Urna postavka posodobljena', severity: 'success' });
        addErrorLog('success', `Urna postavka posodobljena na ${hourlyRate}€`);
      } catch (error) {
        showError('Napaka pri posodabljanju urne postavke', error);
      }
    }
  };

  const handleViewReservations = async (officeHour) => {
    setSelectedOfficeHour(officeHour);
    if (useMockData) {
      const mockReservations = [
        { id: 1, status: 0, studentName: "Ana Kovač", studentEmail: "ana@student.com", komentarStudenta: "Prosim za pomoč", komentarUcitelja: "" },
        { id: 2, status: 1, studentName: "Janez Novak", studentEmail: "janez@student.com", komentarStudenta: "", komentarUcitelja: "Potrjeno" }
      ];
      setReservationsForOffice(mockReservations);
      setOpenReservationsDialog(true);
    } else {
      try {
        const reservations = await api.getReservationsForOfficeHour(officeHour.id);
        setReservationsForOffice(reservations);
        setOpenReservationsDialog(true);
      } catch (error) {
        showError('Napaka pri nalaganju prijav', error);
      }
    }
  };

  const handleUpdateReservation = async (reservationId, status, comment) => {
    if (useMockData) {
      setReservationsForOffice(prev => prev.map(r => r.id === reservationId ? { ...r, status, komentarUcitelja: comment } : r));
      setSnackbar({ open: true, message: 'Rezervacija posodobljena (mock)', severity: 'success' });
    } else {
      try {
        await api.updateReservation(reservationId, { status, komentarUcitelja: comment });
        setSnackbar({ open: true, message: 'Rezervacija posodobljena', severity: 'success' });
        const updated = await api.getReservationsForOfficeHour(selectedOfficeHour.id);
        setReservationsForOffice(updated);
      } catch (error) {
        showError('Napaka pri posodabljanju rezervacije', error);
      }
    }
  };

  // Admin funkcije
  const handleUpdateUserRole = async (userId, newRoleId) => {
    if (useMockData) {
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, roleId: newRoleId } : u));
      setSnackbar({ open: true, message: 'Vloga posodobljena (mock)', severity: 'success' });
    } else {
      try {
        await api.updateUserRole(userId, newRoleId);
        setSnackbar({ open: true, message: 'Vloga posodobljena', severity: 'success' });
        const usersList = await api.getAllUsers();
        setAllUsers(usersList);
      } catch (error) {
        showError('Napaka pri posodabljanju vloge', error);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Izbris uporabnika bo trajen. Ste prepričani?')) return;
    if (useMockData) {
      setAllUsers(prev => prev.filter(u => u.id !== userId));
      setSnackbar({ open: true, message: 'Uporabnik izbrisan (mock)', severity: 'success' });
    } else {
      try {
        await api.deleteUser(userId);
        setSnackbar({ open: true, message: 'Uporabnik izbrisan', severity: 'success' });
        const usersList = await api.getAllUsers();
        setAllUsers(usersList);
      } catch (error) {
        showError('Napaka pri brisanju uporabnika', error);
      }
    }
  };

  // Admin impersonation
  const handleImpersonate = (selectedUserId) => {
    const target = allUsers.find(u => u.id === selectedUserId);
    if (target) {
      const impersonated = {
        id: target.id,
        name: `${target.ime} ${target.priimek}`,
        email: target.email,
        roleId: target.roleId,
        role: target.roleId === 1 ? 'admin' : target.roleId === 2 ? 'tutor' : target.roleId === 3 ? 'student' : 'professor',
        urnaPostavka: target.urnaPostavka
      };
      setImpersonatedUser(impersonated);
      setUser(impersonated);
      addErrorLog('info', `👑 Admin impersonira: ${impersonated.name} (${impersonated.role})`);
      setSnackbar({ open: true, message: `Zdaj delujete kot ${impersonated.name}`, severity: 'info' });
      loadData();
    }
  };

  const stopImpersonation = () => {
    setImpersonatedUser(null);
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      addErrorLog('info', '👑 Admin je končal impersonacijo');
      setSnackbar({ open: true, message: 'Vrnili ste se v admin vlogo', severity: 'info' });
      loadData();
    }
  };

  // Dodajanje predmetov za tutorja
  const handleAddTutorSubject = async (subjectId) => {
    if (useMockData) {
      const newSubject = subjects.find(s => s.id === subjectId);
      if (newSubject && !tutorSubjects.some(ts => ts.id === subjectId)) {
        setTutorSubjects([...tutorSubjects, newSubject]);
        setSnackbar({ open: true, message: 'Predmet dodan (mock)', severity: 'success' });
      }
    } else {
      try {
        await api.addTutorSubject(user.id, subjectId);
        const updated = await api.getTutorSubjects(user.id);
        setTutorSubjects(updated);
        setSnackbar({ open: true, message: 'Predmet dodan', severity: 'success' });
      } catch (error) {
        showError('Napaka pri dodajanju predmeta', error);
      }
    }
  };

  const handleRemoveTutorSubject = async (subjectId) => {
    if (useMockData) {
      setTutorSubjects(tutorSubjects.filter(s => s.id !== subjectId));
      setSnackbar({ open: true, message: 'Predmet odstranjen (mock)', severity: 'success' });
    } else {
      try {
        await api.removeTutorSubject(user.id, subjectId);
        const updated = await api.getTutorSubjects(user.id);
        setTutorSubjects(updated);
        setSnackbar({ open: true, message: 'Predmet odstranjen', severity: 'success' });
      } catch (error) {
        showError('Napaka pri odstranjevanju predmeta', error);
      }
    }
  };

  // Helper za filtriranje in sortiranje ur za študenta
  const getFilteredSortedHours = () => {
    let filtered = officeHours.filter(oh => {
      const searchLower = searchTerm.toLowerCase();
      return (
        oh.predmet?.naziv?.toLowerCase().includes(searchLower) ||
        oh.uporabnik?.ime?.toLowerCase().includes(searchLower) ||
        oh.uporabnik?.priimek?.toLowerCase().includes(searchLower) ||
        oh.učilnica?.toLowerCase().includes(searchLower)
      );
    });

    filtered.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'date':
          valA = new Date(a.zacetek);
          valB = new Date(b.zacetek);
          break;
        case 'subject':
          valA = a.predmet?.naziv || '';
          valB = b.predmet?.naziv || '';
          break;
        case 'teacher':
          valA = `${a.uporabnik?.ime} ${a.uporabnik?.priimek}`;
          valB = `${b.uporabnik?.ime} ${b.uporabnik?.priimek}`;
          break;
        default:
          valA = new Date(a.zacetek);
          valB = new Date(b.zacetek);
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    loadData();
  }, []);

  useEffect(() => {
    if (user && !useMockData) loadRealData();
  }, [useMockData, user]);

  const getRoleLabel = (roleId) => ({ 1: 'admin', 2: 'tutor', 3: 'student', 4: 'professor' }[roleId] || 'student');
  const getRoleColor = () => {
    switch (getRoleLabel(user?.roleId)) {
      case 'admin': return '#f44336';
      case 'professor': return '#2196f3';
      case 'tutor': return '#4caf50';
      case 'student': return '#ff9800';
      default: return '#9e9e9e';
    }
  };
  const getRoleColorByRole = (role) => ({ admin: '#f44336', professor: '#2196f3', tutor: '#4caf50', student: '#ff9800' }[role] || '#9e9e9e');
  const getStatusIcon = () => useMockData ? <WarningIcon sx={{ color: '#ff9800' }} /> : (backendStatus === 'connected' ? <CheckCircleIcon sx={{ color: '#4caf50' }} /> : <ErrorIcon sx={{ color: '#f44336' }} />);
  const getStatusText = () => useMockData ? '📦 MOCK način' : (backendStatus === 'connected' ? '✅ Backend povezan' : '❌ Backend nedosegljiv');

  // Dashboard komponente
  const StudentDashboard = () => {
    const filteredSortedHours = getFilteredSortedHours();
    return (
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
                      {oh.komentarUcitelja && <Typography color="textSecondary">💬 Učitelj: {oh.komentarUcitelja}</Typography>}
                    </CardContent>
                    <CardActions>
                      <Button size="small" color="error" onClick={() => handleCancelEnrollment(oh.id)}>Prekliči prijavo</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Išči po predmetu, učitelju, učilnici..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sortiraj po</InputLabel>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sortiraj po">
              <MenuItem value="date">Datumu</MenuItem>
              <MenuItem value="subject">Predmetu</MenuItem>
              <MenuItem value="teacher">Učitelju</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Vrstni red</InputLabel>
            <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} label="Vrstni red">
              <MenuItem value="asc">Naraščajoče</MenuItem>
              <MenuItem value="desc">Padajoče</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        <Typography variant="h5" gutterBottom>📖 Razpoložljive govorilne ure</Typography>
        <Grid container spacing={3}>
          {filteredSortedHours.map(oh => (
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
                  <Button variant="contained" fullWidth onClick={() => handleEnroll(oh.id)}>Prijavi se</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          {filteredSortedHours.length === 0 && (
            <Typography sx={{ textAlign: 'center', width: '100%', mt: 4 }}>Ni govorilnih ur, ki bi ustrezale iskanju.</Typography>
          )}
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
                  <Button fullWidth variant="outlined" href={`mailto:${tutor.email}`}>Kontaktiraj</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const ProfessorDashboard = () => (
    <Box>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingOffice(null); setOpenOfficeDialog(true); }} sx={{ mb: 3 }}>Dodaj govorilno uro</Button>
      <Grid container spacing={3}>
        {officeHours.filter(oh => oh.uporabnik?.id === user?.id).map(oh => (
          <Grid item xs={12} md={6} key={oh.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{oh.predmet?.naziv || 'Brez predmeta'}</Typography>
                <Typography>📅 {new Date(oh.zacetek).toLocaleString()}</Typography>
                <Typography>📍 Učilnica: {oh.učilnica}</Typography>
                <Button size="small" startIcon={<CommentIcon />} onClick={() => handleViewReservations(oh)}>Prijave ({oh.rezervacije?.length || 0})</Button>
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

  const TutorDashboard = () => {
    const tutorOfficeHours = officeHours.filter(oh => oh.uporabnik?.id === user?.id);
    const allReservations = tutorOfficeHours.flatMap(oh => 
      (oh.rezervacije || []).map(r => ({ ...r, officeHour: oh }))
    );
    const uniqueStudents = [...new Map(allReservations.map(r => [r.Uporabnik_id, r])).values()];

    return (
      <Box>
        <Card sx={{ mb: 3, bgcolor: '#e3f2fd' }}>
          <CardContent>
            <Typography variant="h5">👋 Pozdravljen, {user?.name}!</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
              <TextField label="Urna postavka (€)" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} size="small" />
              <Button variant="contained" onClick={handleUpdateHourlyRate}>Shrani</Button>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="h5" gutterBottom>📚 Predmeti, ki jih poučujem</Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {tutorSubjects.map(subj => (
            <Grid item key={subj.id}>
              <Chip label={subj.naziv} onDelete={() => handleRemoveTutorSubject(subj.id)} />
            </Grid>
          ))}
          <Grid item>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Dodaj predmet</InputLabel>
              <Select
                value=""
                onChange={(e) => handleAddTutorSubject(e.target.value)}
                label="Dodaj predmet"
              >
                {subjects.filter(s => !tutorSubjects.some(ts => ts.id === s.id)).map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.naziv}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Typography variant="h5" gutterBottom>📋 Pregled prijav na moje ure</Typography>
        {allReservations.length === 0 ? (
          <Typography>Ni prijav na vaše ure.</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Študent</TableCell>
                  <TableCell>Predmet</TableCell>
                  <TableCell>Datum ure</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Komentar študenta</TableCell>
                  <TableCell>Akcija</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allReservations.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{r.Uporabnik?.ime} {r.Uporabnik?.priimek}</TableCell>
                    <TableCell>{r.officeHour?.predmet?.naziv}</TableCell>
                    <TableCell>{new Date(r.officeHour?.zacetek).toLocaleString()}</TableCell>
                    <TableCell>{r.status === 0 ? 'Čaka' : r.status === 1 ? 'Potrjeno' : r.status === 2 ? 'Preklicano' : 'Opravljeno'}</TableCell>
                    <TableCell>{r.komentar_studenta || '-'}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleViewReservations(r.officeHour)}>Pogled</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Typography variant="h5" gutterBottom>👥 Moji učenci</Typography>
        {uniqueStudents.length === 0 ? (
          <Typography>Še nimate prijavljenih učencev.</Typography>
        ) : (
          <Grid container spacing={2}>
            {uniqueStudents.map(s => (
              <Grid item xs={12} sm={6} md={4} key={s.Uporabnik_id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{s.Uporabnik?.ime} {s.Uporabnik?.priimek}</Typography>
                    <Typography>{s.Uporabnik?.email}</Typography>
                    <Typography variant="caption">Zadnja prijava: {new Date(s.officeHour?.zacetek).toLocaleDateString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState(0);
    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card><CardContent><Typography variant="h6">📊 Govorilne ure</Typography><Typography variant="h3">{allOfficeHours.length}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card><CardContent><Typography variant="h6">👨‍🏫 Tutorji</Typography><Typography variant="h3">{tutors.length}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card><CardContent><Typography variant="h6">📚 Predmeti</Typography><Typography variant="h3">{subjects.length}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card><CardContent><Typography variant="h6">👥 Uporabniki</Typography><Typography variant="h3">{allUsers.length}</Typography></CardContent></Card>
          </Grid>
        </Grid>

        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
          <Tab label="📅 Vse govorilne ure" />
          <Tab label="👥 Uporabniki sistema" />
        </Tabs>

        {activeTab === 0 && (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Predmet</TableCell>
                  <TableCell>Učitelj</TableCell>
                  <TableCell>Začetek</TableCell>
                  <TableCell>Konec</TableCell>
                  <TableCell>Učilnica</TableCell>
                  <TableCell>Št. prijav</TableCell>
                  <TableCell>Akcije</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allOfficeHours.map(oh => (
                  <TableRow key={oh.id}>
                    <TableCell>{oh.id}</TableCell>
                    <TableCell>{oh.predmet?.naziv || '-'}</TableCell>
                    <TableCell>{oh.uporabnik?.ime} {oh.uporabnik?.priimek}</TableCell>
                    <TableCell>{new Date(oh.zacetek).toLocaleString()}</TableCell>
                    <TableCell>{oh.konec ? new Date(oh.konec).toLocaleString() : '-'}</TableCell>
                    <TableCell>{oh.učilnica}</TableCell>
                    <TableCell>{oh.rezervacije?.length || 0}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => { setEditingOffice(oh); setOpenOfficeDialog(true); }}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDeleteOfficeHour(oh.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 1 && (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Ime</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Vloga</TableCell>
                  <TableCell>Urna postavka</TableCell>
                  <TableCell>Akcije</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allUsers.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.ime} {u.priimek}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Select size="small" value={u.roleId} onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}>
                        <MenuItem value={1}>Admin</MenuItem>
                        <MenuItem value={2}>Tutor</MenuItem>
                        <MenuItem value={3}>Student</MenuItem>
                        <MenuItem value={4}>Professor</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>{u.urnaPostavka ? `${u.urnaPostavka}€` : '-'}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleImpersonate(u.id)}><SwapHorizIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDeleteUser(u.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );
  };

  const renderDashboard = () => {
    const role = getRoleLabel(user?.roleId);
    switch (role) {
      case 'admin': return <AdminDashboard />;
      case 'professor': return <ProfessorDashboard />;
      case 'tutor': return <TutorDashboard />;
      default: return <StudentDashboard />;
    }
  };

  // DEBUG PANEL – samo admin
  const DebugPanel = () => {
    if (!user || user.roleId !== 1) return null;
    return (
      <Drawer anchor="left" open={debugOpen} onClose={() => setDebugOpen(false)}>
        <Box sx={{ width: 380, p: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}><BugReportIcon /> Debug Panel (samo admin)</Typography>
          <Divider />
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>📡 Status</Typography>
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>{getStatusIcon()}<Typography variant="body2">{getStatusText()}</Typography></Box>
            <FormControlLabel control={<Switch checked={useMockData} onChange={(e) => { setUseMockData(e.target.checked); if (e.target.checked) loadMockData(); else loadRealData(); }} />} label="Uporabi Mock podatke" />
            <Button size="small" startIcon={<RefreshIcon />} onClick={() => loadData()} sx={{ mt: 1 }}>Osveži podatke</Button>
          </Paper>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>👤 Trenutni uporabnik</Typography>
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
            <Typography><strong>Ime:</strong> {user.name}</Typography>
            <Typography><strong>Email:</strong> {user.email}</Typography>
            <Typography><strong>Vloga:</strong> {getRoleLabel(user.roleId)}</Typography>
            <Button size="small" color="error" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ mt: 1 }}>Odjava</Button>
          </Paper>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>🔑 Mock prijava</Typography>
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
            <Grid container spacing={1}>
              {mockUsers.map(mockUser => (
                <Grid item xs={6} key={mockUser.id}>
                  <Button fullWidth variant="outlined" size="small" onClick={() => handleMockLogin(mockUser)} sx={{ textTransform: 'none', bgcolor: getRoleColorByRole(mockUser.role) + '20', borderColor: getRoleColorByRole(mockUser.role) }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: 12, bgcolor: getRoleColorByRole(mockUser.role) }}>{mockUser.name.charAt(0)}</Avatar>{mockUser.name}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>📋 Error Log</Typography>
          <Paper variant="outlined" sx={{ p: 1, maxHeight: 300, overflow: 'auto' }}>
            {errorLogs.length === 0 ? (<Typography variant="body2" color="textSecondary" align="center">Ni napak</Typography>) : (
              errorLogs.map(log => (
                <Box key={log.id} sx={{ mb: 1, p: 0.5, borderLeft: 3, borderColor: log.type === 'error' ? '#f44336' : log.type === 'success' ? '#4caf50' : '#2196f3', bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="caption" color="textSecondary">{log.timestamp}</Typography>
                  <Typography variant="body2" sx={{ color: log.type === 'error' ? '#f44336' : log.type === 'success' ? '#4caf50' : '#2196f3' }}>{log.message}</Typography>
                  {log.details && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>Podrobnosti</AccordionSummary>
                      <AccordionDetails><pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>{log.details}</pre></AccordionDetails>
                    </Accordion>
                  )}
                </Box>
              ))
            )}
          </Paper>
        </Box>
      </Drawer>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Nalagam aplikacijo...</Typography>
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
              <TextField fullWidth label="Email" type="email" margin="normal" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
              <TextField fullWidth label="Geslo" type="password" margin="normal" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
              <Button fullWidth variant="contained" onClick={handleLogin} disabled={loading} sx={{ mt: 3 }}>Prijava</Button>
            </Box>
          ) : (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}><TextField fullWidth label="Ime" value={registerIme} onChange={(e) => setRegisterIme(e.target.value)} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Priimek" value={registerPriimek} onChange={(e) => setRegisterPriimek(e.target.value)} /></Grid>
              </Grid>
              <TextField fullWidth label="Email" type="email" margin="normal" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} />
              <TextField fullWidth label="Geslo" type="password" margin="normal" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} />
              <TextField fullWidth label="Potrdi geslo" type="password" margin="normal" value={registerConfirmPassword} onChange={(e) => setRegisterConfirmPassword(e.target.value)} />
              <Button fullWidth variant="contained" onClick={handleRegister} disabled={loading} sx={{ mt: 3 }}>Registracija</Button>
            </Box>
          )}
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {user.roleId === 1 && (
        <IconButton 
          onClick={() => setDebugOpen(true)} 
          sx={{ 
            position: 'fixed', 
            left: 10, 
            top: '50%', 
            transform: 'translateY(-50%)', 
            zIndex: 1300, 
            bgcolor: 'white', 
            boxShadow: 2,
            '&:hover': { bgcolor: '#f5f5f5' }
          }}
        >
          <BugReportIcon />
        </IconButton>
      )}

      <AppBar position="static" sx={{ bgcolor: getRoleColor() }}>
        <Toolbar>
          <EventIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>📚 TutorHub</Typography>
          <Chip 
            avatar={<Avatar>{user.name?.charAt(0)}</Avatar>} 
            label={`${user.name} (${getRoleLabel(user.roleId)})`} 
            onClick={(e) => setAnchorEl(e.currentTarget)} 
            sx={{ bgcolor: 'white', color: getRoleColor(), cursor: 'pointer' }} 
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
            onChange={(e) => editingOffice ? setEditingOffice({ ...editingOffice, zacetek: e.target.value }) : setNewOfficeHour({ ...newOfficeHour, zacetek: e.target.value })}
          />
          <TextField
            fullWidth
            type="datetime-local"
            label="Konec (opcijsko)"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={editingOffice ? editingOffice.konec?.slice(0, 16) : newOfficeHour.konec}
            onChange={(e) => editingOffice ? setEditingOffice({ ...editingOffice, konec: e.target.value }) : setNewOfficeHour({ ...newOfficeHour, konec: e.target.value })}
          />
          <TextField
            fullWidth
            label="Učilnica"
            margin="normal"
            value={editingOffice ? editingOffice.učilnica : newOfficeHour.učilnica}
            onChange={(e) => editingOffice ? setEditingOffice({ ...editingOffice, učilnica: e.target.value }) : setNewOfficeHour({ ...newOfficeHour, učilnica: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Predmet</InputLabel>
            <Select
              value={editingOffice ? editingOffice.predmet_id || '' : newOfficeHour.predmetId}
              onChange={(e) => editingOffice 
                ? setEditingOffice({ ...editingOffice, predmet_id: e.target.value ? parseInt(e.target.value) : null })
                : setNewOfficeHour({ ...newOfficeHour, predmetId: e.target.value })}
              label="Predmet"
            >
              <MenuItem value=""><em>Brez predmeta</em></MenuItem>
              {subjects.map(s => (
                <MenuItem key={s.id} value={s.id}>{s.naziv}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenOfficeDialog(false); setEditingOffice(null); }}>Prekliči</Button>
          <Button variant="contained" onClick={editingOffice ? handleUpdateOfficeHour : handleCreateOfficeHour}>
            {editingOffice ? 'Shrani' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openReservationsDialog} onClose={() => setOpenReservationsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Prijave na govorilno uro: {selectedOfficeHour?.predmet?.naziv}</DialogTitle>
        <DialogContent>
          {reservationsForOffice.map(res => (
            <Card key={res.id} sx={{ mb: 2, p: 2 }}>
              <Typography><strong>Študent:</strong> {res.studentName} ({res.studentEmail})</Typography>
              <Typography><strong>Status:</strong> {res.status === 0 ? 'Čaka' : res.status === 1 ? 'Potrjeno' : res.status === 2 ? 'Preklicano' : 'Opravljeno'}</Typography>
              <TextField fullWidth label="Komentar študenta" multiline rows={2} value={res.komentarStudenta || ''} disabled sx={{ mt: 1 }} />
              <TextField fullWidth label="Komentar učitelja" multiline rows={2} value={res.komentarUcitelja || ''} onChange={(e) => setEditingReservation({ ...res, komentarUcitelja: e.target.value })} sx={{ mt: 1 }} />
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Select size="small" value={res.status} onChange={(e) => handleUpdateReservation(res.id, e.target.value, editingReservation?.komentarUcitelja)}>
                  <MenuItem value={0}>Čaka</MenuItem>
                  <MenuItem value={1}>Potrjeno</MenuItem>
                  <MenuItem value={2}>Preklicano</MenuItem>
                  <MenuItem value={3}>Opravljeno</MenuItem>
                </Select>
                <Button variant="contained" onClick={() => handleUpdateReservation(res.id, res.status, editingReservation?.komentarUcitelja)}>Shrani</Button>
              </Box>
            </Card>
          ))}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenReservationsDialog(false)}>Zapri</Button></DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      <DebugPanel />
    </Box>
  );
}

export default App;