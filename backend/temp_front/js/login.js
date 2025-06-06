// js/login.js

document.addEventListener('DOMContentLoaded', () => {
    // Se já houver um token, redireciona para a página principal
    if (localStorage.getItem('authToken')) {
        window.location.href = 'index.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', handleLoginSubmit);
});

async function handleLoginSubmit(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showLoginAlert('Por favor, preencha o e-mail e a senha.', 'warning');
        return;
    }

    // Desabilita o botão e mostra um "Carregando..."
    loginButton.disabled = true;
    loginButton.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Entrando...`;

    try {
        // Chama a função de login da API (que vamos adicionar em api.js)
        // **Importante:** O backend espera 'username'. Se você configurou para usar 'email'
        // como USERNAME_FIELD, você ainda deve enviar o email no campo 'username' para
        // o endpoint padrão ObtainAuthToken.
        const data = await api.login(email, password);

        if (data.token) {
            // Salva o token e dados do usuário no localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userEmail', data.email);

            // Redireciona para a página principal
            window.location.href = 'index.html';
        } else {
            throw new Error('Resposta inválida do servidor.');
        }

    } catch (error) {
        console.error('Erro no login:', error);
        showLoginAlert('Usuário ou senha incorreto. Verifique suas credenciais.', 'danger');
        // Reabilita o botão
        loginButton.disabled = false;
        loginButton.textContent = 'Entrar';
    }
}

// Função simples para mostrar alertas na tela de login
function showLoginAlert(message, type = 'danger') {
    const alertContainer = document.getElementById('login-alert-container');
    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}