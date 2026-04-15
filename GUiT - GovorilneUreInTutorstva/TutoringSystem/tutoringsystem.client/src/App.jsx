const StudentDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const filteredSortedHours = getFilteredSortedHours();

  return (
    <Box>
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="📖 Razpoložljive govorilne ure" />
        <Tab label="👨‍🏫 Tutorji" />
      </Tabs>

      {/* Zavihek: Govorilne ure */}
      {tabValue === 0 && (
        <>
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
              key="search-field"
              size="small"
              placeholder="Išči po predmetu, učitelju, učilnici..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
              sx={{ minWidth: 250 }}
              autoFocus
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
                    <Chip label={`Prostih: ${5 - (oh.rezervacije?.length || 0)}`} color="success" size="small" sx={{ mt: 1 }} />
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
        </>
      )}

      {/* Zavihek: Tutorji */}
      {tabValue === 1 && (
        <>
          <Typography variant="h5" gutterBottom>👨‍🏫 Seznam tutorjev</Typography>
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
        </>
      )}
    </Box>
  );
};