import { useState, useEffect } from 'react'

// Update your API object to call your C# backend
const API_BASE_URL = 'https://localhost:7000/api/tutoring'; // Change port as needed

const API = {
    getOfficeHours: async () => {
        const response = await fetch(`${API_BASE_URL}/officehours`);
        return response.json();
    },
    createOfficeHour: async (data) => {
        const response = await fetch(`${API_BASE_URL}/officehours`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },
    updateOfficeHour: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/officehours/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },
    deleteOfficeHour: async (id) => {
        await fetch(`${API_BASE_URL}/officehours/${id}`, { method: 'DELETE' });
    },
    getTutors: async () => {
        const response = await fetch(`${API_BASE_URL}/tutors`);
        return response.json();
    },
    createTutor: async (data) => {
        const response = await fetch(`${API_BASE_URL}/tutors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },
    updateTutor: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/tutors/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },
    deleteTutor: async (id) => {
        await fetch(`${API_BASE_URL}/tutors/${id}`, { method: 'DELETE' });
    }
}

// Rest of your App component remains exactly the same
// (All your existing JSX code stays unchanged)