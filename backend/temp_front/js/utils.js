// Formatar data para exibição (dd/mm/aaaa)
function formatDate(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Formatar data para enviar ao backend (aaaa-mm-dd)
function formatDateForInput(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('/');
    if (parts.length !== 3) return dateString;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// Formatar CPF para exibição
function formatCPF(cpf) {
    if (!cpf) return '';
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return cpf;
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Romover formatação do cpf para enviar ao backend
function unformatCPF(cpf) {
    return cpf ? cpf.replace(/\D/g, '') : '';
}

// Formatar CEP para exibição
function formatCEP(cep) {
    if (!cep) return '';
    cep = cep.replace(/\D/g, '');
    if (cep.length !== 8) return cep;
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
}

// Romover formatação do cep para enviar ao backend
function unformatCEP(cep) {
    return cep ? cep.replace(/\D/g, '') : '';
}

// Mostrar alerta temporário
function showAlert(message, type = 'success', duration = 5000) {
    const alertContainer = document.getElementById('alert-container');
    const alertId = 'alert-' + Date.now();
    
    const alertHTML = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    alertContainer.insertAdjacentHTML('beforebegin', alertHTML);
    
    if (duration > 0) {
        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                alertElement.classList.add('alert-fade');
                alertElement.style.opacity = '0';
                setTimeout(() => alertElement.remove(), 250);
            }
        }, duration);
    }
    
    return alertId;
}

// Validar formulário
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input, select');
    let isValid = true;
    
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else if (input.id === 'guardian_cpf' && unformatCPF(input.value).length !== 11) {
            input.classList.add('is-invalid');
            isValid = false;
        } else if (input.id === 'cep' && unformatCEP(input.value).length !== 8) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Mostrar loader
function showLoader() {
    document.getElementById('loader').classList.remove('d-none');
    document.getElementById('students-table-container').classList.add('d-none');
    document.getElementById('no-students-message').classList.add('d-none');
}

// Esconder loader
function hideLoader() {
    document.getElementById('loader').classList.add('d-none');
}

// Mostrar tabela ou mensagem de nenhum aluno (d-none = display none)
function showTableOrMessage(hasStudents) {
    if (hasStudents) {
        document.getElementById('students-table-container').classList.remove('d-none');
        document.getElementById('no-students-message').classList.add('d-none');
    } else {
        document.getElementById('students-table-container').classList.add('d-none');
        document.getElementById('no-students-message').classList.remove('d-none');
    }
}