const API_BASE_URL = 'http://localhost:5236/api/Tutoring';

export const api = {
    // Test
    test: async () => {
        const response = await fetch(`${API_BASE_URL}/test`);
        return response.ok;
    },

    // Prijava
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

    // Registracija
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

    // Govorilne ure
    getOfficeHours: async () => {
        const response = await fetch(`${API_BASE_URL}/officehours`);
        if (!response.ok) throw new Error('Napaka pri nalaganju govorilnih ur');
        return response.json();
    },

    getMyOfficeHours: async (professorId) => {
        const response = await fetch(`${API_BASE_URL}/officehours/professor/${professorId}`);
        if (!response.ok) throw new Error('Napaka pri nalaganju');
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

    // Prijave študentov
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

    // Tutorji
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

    updateTutor: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/tutors/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Napaka pri posodabljanju tutorja');
        return response.json();
    },

    deleteTutor: async (id) => {
        const response = await fetch(`${API_BASE_URL}/tutors/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Napaka pri brisanju tutorja');
    },

    // Predmeti
    getSubjects: async () => {
        const response = await fetch(`${API_BASE_URL}/subjects`);
        if (!response.ok) throw new Error('Napaka pri nalaganju predmetov');
        return response.json();
    },

    // Statistika
    getStats: async () => {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (!response.ok) throw new Error('Napaka pri nalaganju statistike');
        return response.json();
    }
};