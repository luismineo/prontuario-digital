class API {
    constructor(baseUrl) {
        this.baseUrl = baseUrl || 'http://localhost:8000/';
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
        };
    }

    async handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }

    async getActiveStudents() {
        const response = await fetch(`${this.baseUrl}/api/students/`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async getInactiveStudents() {
        const response = await fetch(`${this.baseUrl}/api/students/inactive/`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async getStudent(id) {
        const response = await fetch(`${this.baseUrl}/api/students/${id}/`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async createStudent(studentData) {
        const response = await fetch(`${this.baseUrl}/api/students/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(studentData)
        });
        return this.handleResponse(response);
    }

    async updateStudent(id, studentData) {
        const response = await fetch(`${this.baseUrl}/api/students/${id}/`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(studentData)
        });
        return this.handleResponse(response);
    }

    async deleteStudent(id) {
        const response = await fetch(`${this.baseUrl}/api/students/${id}/`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        
        if (!response.ok) {
            return this.handleResponse(response);
        }
        
        return { success: true };
    }

    async restoreStudent(id) {
        const response = await fetch(`${this.baseUrl}/api/students/${id}/restore/`, {
            method: 'PUT',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
}

const api = new API();