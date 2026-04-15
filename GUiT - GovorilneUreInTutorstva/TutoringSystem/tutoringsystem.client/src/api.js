const API_BASE_URL = 'http://localhost:5236/api/Tutoring';

export const api = {
    test: async () => {
        const response = await fetch(`${API_BASE_URL}/test`);
        return response.ok;
    },

    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Prijava ni uspela');
        }
        return response.json();
    },

    register: async (data) => {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registracija ni uspela');
        }
        return response.json();
    },

    getOfficeHours: async () => {
        const response = await fetch(`${API_BASE_URL}/officehours`);
        if (!response.ok) throw new Error('Napaka pri nalaganju govorilnih ur');
        return response.json();
    },

    getOfficeHour: async (id) => {
        const response = await fetch(`${API_BASE_URL}/officehours/${id}`);
        if (!response.ok) throw new Error('Napaka pri nalaganju govorilne ure');
        return response.json();
    },

    createOfficeHour: async (data) => {
        const response = await fetch(`${API_BASE_URL}/officehours`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Napaka pri ustvarjanju');
        }
        return response.json();
    },

    updateOfficeHour: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/officehours/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Napaka pri posodabljanju');
        }
        return response.json();
    },

    deleteOfficeHour: async (id) => {
        const response = await fetch(`${API_BASE_URL}/officehours/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Napaka pri brisanju');
        }
    },

    enrollStudent: async (officeId, studentId) => {
        const response = await fetch(`${API_BASE_URL}/officehours/${officeId}/enroll`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentId)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Napaka pri prijavi');
        }
        return response.json();
    },

    cancelEnrollment: async (officeId, studentId) => {
        const response = await fetch(`${API_BASE_URL}/officehours/${officeId}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentId)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Napaka pri preklicu');
        }
        return response.json();
    },

    getMyEnrollments: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/my-enrollments/${userId}`);
        if (!response.ok) throw new Error('Napaka pri nalaganju prijav');
        return response.json();
    },

    getTutors: async () => {
        const response = await fetch(`${API_BASE_URL}/tutors`);
        if (!response.ok) throw new Error('Napaka pri nalaganju tutorjev');
        return response.json();
    },

    getTutor: async (id) => {
        const response = await fetch(`${API_BASE_URL}/tutors/${id}`);
        if (!response.ok) throw new Error('Napaka pri nalaganju tutorja');
        return response.json();
    },

    getSubjects: async () => {
        const response = await fetch(`${API_BASE_URL}/subjects`);
        if (!response.ok) throw new Error('Napaka pri nalaganju predmetov');
        return response.json();
    },

    getStats: async () => {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (!response.ok) throw new Error('Napaka pri nalaganju statistike');
        return response.json();
    },

    // TUTOR SPECIFIČNE
    getTutorSubjects: async (userId) => {
        const res = await fetch(`${API_BASE_URL}/tutor/${userId}/subjects`);
        if (!res.ok) throw new Error('Napaka pri nalaganju predmetov');
        return res.json();
    },
    addTutorSubject: async (userId, subjectId) => {
        const res = await fetch(`${API_BASE_URL}/tutor/${userId}/subjects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subjectId)
        });
        if (!res.ok) throw new Error('Napaka pri dodajanju predmeta');
        return res.json();
    },
    removeTutorSubject: async (userId, subjectId) => {
        const res = await fetch(`${API_BASE_URL}/tutor/${userId}/subjects/${subjectId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Napaka pri odstranjevanju predmeta');
        return res.json();
    },
    updateHourlyRate: async (userId, rate) => {
        const res = await fetch(`${API_BASE_URL}/tutor/${userId}/hourly-rate`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rate)
        });
        if (!res.ok) throw new Error('Napaka pri posodabljanju urne postavke');
        return res.json();
    },
    getReservationsForOfficeHour: async (officeHourId) => {
        const res = await fetch(`${API_BASE_URL}/officehours/${officeHourId}/reservations`);
        if (!res.ok) throw new Error('Napaka pri nalaganju prijav');
        return res.json();
    },
    updateReservation: async (reservationId, data) => {
        const res = await fetch(`${API_BASE_URL}/reservations/${reservationId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Napaka pri posodabljanju rezervacije');
        return res.json();
    },

    // ADMIN SPECIFIČNE
    getAllUsers: async () => {
        const res = await fetch(`${API_BASE_URL}/admin/users`);
        if (!res.ok) throw new Error('Napaka pri nalaganju uporabnikov');
        return res.json();
    },
    updateUserRole: async (userId, newRoleId) => {
        const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRoleId)
        });
        if (!res.ok) throw new Error('Napaka pri posodabljanju vloge');
        return res.json();
    },
    deleteUser: async (userId) => {
        const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Napaka pri brisanju uporabnika');
        return res.json();
    }
};