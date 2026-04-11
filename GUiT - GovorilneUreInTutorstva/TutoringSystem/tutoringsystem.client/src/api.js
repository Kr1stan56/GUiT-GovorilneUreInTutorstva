const API_BASE_URL = 'http://localhost:5236/api/Tutoring';

export const api = {
    // Prijava
    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) throw new Error('Login failed');
        return response.json();
    },

    // Govorilne ure
    getOfficeHours: async () => {
        const response = await fetch(`${API_BASE_URL}/officehours`);
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
    },

    createOfficeHour: async (data) => {
        const response = await fetch(`${API_BASE_URL}/officehours`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create');
        return response.json();
    },

    updateOfficeHour: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/officehours/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update');
        return response.json();
    },

    deleteOfficeHour: async (id) => {
        const response = await fetch(`${API_BASE_URL}/officehours/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete');
    },

    enrollStudent: async (officeId, studentId) => {
        const response = await fetch(`${API_BASE_URL}/officehours/${officeId}/enroll`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentId)
        });
        if (!response.ok) throw new Error('Failed to enroll');
        return response.json();
    },

    cancelEnrollment: async (officeId, studentId) => {
        const response = await fetch(`${API_BASE_URL}/officehours/${officeId}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentId)
        });
        if (!response.ok) throw new Error('Failed to cancel');
        return response.json();
    },

    // Tutorji
    getTutors: async () => {
        const response = await fetch(`${API_BASE_URL}/tutors`);
        if (!response.ok) throw new Error('Failed to fetch tutors');
        return response.json();
    },

    updateTutor: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/tutors/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update tutor');
        return response.json();
    },

    deleteTutor: async (id) => {
        const response = await fetch(`${API_BASE_URL}/tutors/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete tutor');
    }
};