class API {
    constructor(baseUrl) {
        this.baseUrl = baseUrl || 'http://localhost:8000/';
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        // Pega o token do localStorage
        const token = localStorage.getItem('authToken');
        if (token) {
            // Adiciona o cabeçalho Authorization se o token existir
            headers['Authorization'] = `Token ${token}`;
        }
        return headers;
    }

    async handleResponse(response) {
        if (response.status === 204) { // Handle No Content (DELETE, PUT sem retorno)
            return { success: true };
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            // Tenta pegar a mensagem de erro do DRF (detail ou non_field_errors)
            const errorMessage = data.detail || (data.non_field_errors ? data.non_field_errors[0] : `Erro ${response.status}: ${response.statusText}`);
            console.error("API Error Data:", data); // Log para debug
            throw new Error(errorMessage);
        }
        return data; // Retorna os dados se a resposta for OK
    }

    async login(email, password) {
        const response = await fetch(`${this.baseUrl}/api/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // Login não envia token
            // IMPORTANTE: Envie o email como 'username' se estiver usando o ObtainAuthToken padrão
            body: JSON.stringify({ username: email, password: password })
        });
        // O handleResponse tratará erros ou retornará os dados (token, user_id, etc.)
        return this.handleResponse(response);
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