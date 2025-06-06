let currentMode = 'active';
let currentStudents = [];
let studentModal = null;
let confirmModal = null;
let confirmCallback = null;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // 1. VERIFICA SE ESTÁ LOGADO
    if (!localStorage.getItem('authToken')) {
        // Se não houver token, redireciona para a tela de login
        window.location.href = 'login.html';
        return; // Para a execução para não carregar o resto
    }

    // 2. SE ESTIVER LOGADO, INICIALIZA A PÁGINA
    initializeMainPage();
});

function initializeMainPage() {
    // Inicializar modais do Bootstrap
    studentModal = new bootstrap.Modal(document.getElementById('student-modal'));
    confirmModal = new bootstrap.Modal(document.getElementById('confirm-modal'));

    // Configurar event listeners
    setupEventListeners();

    // Carregar alunos ativos inicialmente
    loadActiveStudents();

    // Opcional: Mostrar o email/nome do usuário logado em algum lugar
    // const userEmail = localStorage.getItem('userEmail');
    // console.log(`Usuário logado: ${userEmail}`);
}

// Configurar todos os event listeners
function setupEventListeners() {
    // Links de navegação
    document.getElementById('active-students-link').addEventListener('click', (e) => {
        e.preventDefault();
        loadActiveStudents();
    });
    
    document.getElementById('inactive-students-link').addEventListener('click', (e) => {
        e.preventDefault();
        loadInactiveStudents();
    });
    
    // Botão de novo aluno
    document.getElementById('new-student-btn').addEventListener('click', () => {
        openStudentModal();
    });
    
    // Botão de salvar aluno
    document.getElementById('save-student-btn').addEventListener('click', saveStudent);
    
    // Botão de confirmar ação
    document.getElementById('confirm-action-btn').addEventListener('click', () => {
        if (confirmCallback) {
            confirmCallback();
            confirmModal.hide();
        }
    });

    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Validação em tempo real
    const formInputs = document.querySelectorAll('#student-form input, #student-form select');
    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.classList.contains('is-invalid')) {
                validateInput(input);
            }
        });
        
        input.addEventListener('blur', () => {
            validateInput(input);
        });
    });
    
    // Formatação de campos
    document.getElementById('guardian_cpf').addEventListener('input', function() {
        this.value = formatCPF(this.value);
    });
    
    document.getElementById('cep').addEventListener('input', function() {
        this.value = formatCEP(this.value);
    });
}

function handleLogout() {
    // Remove os dados do localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    // Redireciona para a tela de login
    window.location.href = 'login.html';
}

// Validar um input específico
function validateInput(input) {
    if (input.hasAttribute('required') && !input.value.trim()) {
        input.classList.add('is-invalid');
        return false;
    } else if (input.id === 'guardian_cpf' && unformatCPF(input.value).length !== 11) {
        input.classList.add('is-invalid');
        return false;
    } else if (input.id === 'cep' && unformatCEP(input.value).length !== 8) {
        input.classList.add('is-invalid');
        return false;
    } else {
        input.classList.remove('is-invalid');
        return true;
    }
}

// Carregar alunos ativos
async function loadActiveStudents() {
    try {
        currentMode = 'active';
        updateNavLinks();
        document.getElementById('page-title').textContent = 'Alunos Ativos';
        document.getElementById('new-student-btn').classList.remove('d-none');
        
        showLoader();
        
        const students = await api.getActiveStudents();
        currentStudents = students;
        
        renderStudentsTable(students);
        hideLoader();
        showTableOrMessage(students.length > 0);
    } catch (error) {
        hideLoader();
        showAlert(error.message, 'danger');
        console.error('Erro ao carregar alunos ativos:', error);
        if (error.message.includes('401') || error.message.includes('403') || error.message.includes('Authentication credentials were not provided')) {
            handleLogout();
        }
    }
}

// Carregar alunos inativos
async function loadInactiveStudents() {
    try {
        currentMode = 'inactive';
        updateNavLinks();
        document.getElementById('page-title').textContent = 'Alunos Inativos';
        document.getElementById('new-student-btn').classList.add('d-none');
        
        showLoader();
        
        const students = await api.getInactiveStudents();
        currentStudents = students;
        
        renderStudentsTable(students);
        hideLoader();
        showTableOrMessage(students.length > 0);
    } catch (error) {
        hideLoader();
        showAlert(error.message, 'danger');
        console.error('Erro ao carregar alunos inativos:', error);
    }
}

// Atualizar links de navegação
function updateNavLinks() {
    const activeLink = document.getElementById('active-students-link');
    const inactiveLink = document.getElementById('inactive-students-link');
    
    if (currentMode === 'active') {
        activeLink.classList.add('active');
        inactiveLink.classList.remove('active');
    } else {
        activeLink.classList.remove('active');
        inactiveLink.classList.add('active');
    }
}

// Renderizar tabela de alunos
function renderStudentsTable(students) {
    const tableBody = document.getElementById('students-table-body');
    tableBody.innerHTML = '';
    
    students.forEach(student => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.cgm}</td>
            <td>${formatDate(student.dob)}</td>
            <td>${student.guardian}</td>
            <td>${student.city}/${student.state}</td>
            <td>
                ${getActionButtons(student)}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Adicionar event listeners para os botões
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => viewStudent(btn.dataset.id));
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editStudent(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => confirmDeleteStudent(btn.dataset.id));
    });
    
    document.querySelectorAll('.restore-btn').forEach(btn => {
        btn.addEventListener('click', () => confirmRestoreStudent(btn.dataset.id));
    });
}

// Obter botões de ação com base no modo atual
function getActionButtons(student) {
    if (currentMode === 'active') {
        return `
            <button class="btn btn-sm btn-info action-btn view-btn" data-id="${student.id}">
                <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-warning action-btn edit-btn" data-id="${student.id}">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger action-btn delete-btn" data-id="${student.id}">
                <i class="bi bi-trash"></i>
            </button>
        `;
    } else {
        return `
            <button class="btn btn-sm btn-info action-btn view-btn" data-id="${student.id}">
                <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-success action-btn restore-btn" data-id="${student.id}">
                <i class="bi bi-arrow-counterclockwise"></i>
            </button>
        `;
    }
}

// Abrir modal para criar ou editar aluno
function openStudentModal(student = null) {
    const form = document.getElementById('student-form');
    const modalTitle = document.getElementById('modal-title');
    
    // Limpar validações anteriores
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    
    if (student) {
        // Modo de edição
        modalTitle.textContent = 'Editar Aluno';
        document.getElementById('student-id').value = student.id;
        document.getElementById('name').value = student.name;
        document.getElementById('cgm').value = student.cgm;
        document.getElementById('dob').value = student.dob;
        document.getElementById('gender').value = student.gender;
        document.getElementById('guardian').value = student.guardian;
        document.getElementById('guardian_cpf').value = formatCPF(student.guardian_cpf);
        document.getElementById('address').value = student.address;
        document.getElementById('cep').value = formatCEP(student.cep);
        document.getElementById('city').value = student.city;
        document.getElementById('state').value = student.state;
    } else {
        // Modo de criação
        modalTitle.textContent = 'Novo Aluno';
        form.reset();
    }
    
    studentModal.show();
}

// Visualizar detalhes do aluno
async function viewStudent(id) {
    try {
        const student = currentStudents.find(s => s.id === id) || await api.getStudent(id);
        
        openStudentModal(student);
        const modalTitle = document.getElementById('modal-title');
        modalTitle.textContent = 'Visualizar aluno';
        
        // Desabilitar todos os campos para visualização
        document.querySelectorAll('#student-form input, #student-form select').forEach(el => {
            el.setAttribute('disabled', 'disabled');
        });
        
        // Esconder botão de salvar
        document.getElementById('save-student-btn').classList.add('d-none');
    } catch (error) {
        showAlert(error.message, 'danger');
        console.error('Erro ao visualizar aluno:', error);
    }
}

// Editar aluno
async function editStudent(id) {
    try {
        const student = currentStudents.find(s => s.id === id) || await api.getStudent(id);
        
        openStudentModal(student);
        
        // Habilitar todos os campos para edição
        document.querySelectorAll('#student-form input, #student-form select').forEach(el => {
            el.removeAttribute('disabled');
        });
        
        // Mostrar botão de salvar
        document.getElementById('save-student-btn').classList.remove('d-none');
    } catch (error) {
        showAlert(error.message, 'danger');
        console.error('Erro ao editar aluno:', error);
    }
}

// Salvar aluno (criar ou atualizar)
async function saveStudent() {
    if (!validateForm('student-form')) {
        // studentModal.hide();
        showAlert('Por favor, preencha todos os campos obrigatórios corretamente.', 'warning');
        return;
    }
    
    const studentId = document.getElementById('student-id').value;
    const isEditing = !!studentId;
    
    const studentData = {
        name: document.getElementById('name').value,
        cgm: document.getElementById('cgm').value,
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        guardian: document.getElementById('guardian').value,
        guardian_cpf: unformatCPF(document.getElementById('guardian_cpf').value),
        address: document.getElementById('address').value,
        cep: unformatCEP(document.getElementById('cep').value),
        city: document.getElementById('city').value,
        state: document.getElementById('state').value
    };
    
    try {
        if (isEditing) {
            await api.updateStudent(studentId, studentData);
            showAlert('Aluno atualizado com sucesso!', 'success');
        } else {
            await api.createStudent(studentData);
            showAlert('Aluno criado com sucesso!', 'success');
        }
        
        studentModal.hide();
        loadActiveStudents();
    } catch (error) {
        showAlert(error.message, 'danger');
        console.error('Erro ao salvar aluno:', error);
    }
}

// Confirmar exclusão de aluno
function confirmDeleteStudent(id) {
    const student = currentStudents.find(s => s.id === id);
    if (!student) return;
    
    document.getElementById('confirm-modal-title').textContent = 'Confirmar Exclusão';
    document.getElementById('confirm-modal-body').textContent = 
    `Tem certeza que deseja excluir o aluno "${student.name}"?`;
    document.getElementById('confirm-action-btn').className = 'btn btn-danger';
    document.getElementById('confirm-action-btn').textContent = 'Excluir';
    
    confirmCallback = () => deleteStudent(id);
    confirmModal.show();
}

// Excluir aluno
async function deleteStudent(id) {
    try {
        await api.deleteStudent(id);
        showAlert('Aluno excluído com sucesso!', 'success');
        loadActiveStudents();
    } catch (error) {
        showAlert(error.message, 'danger');
        console.error('Erro ao excluir aluno:', error);
    }
}

// Confirmar restauração de aluno
function confirmRestoreStudent(id) {
    const student = currentStudents.find(s => s.id === id);
    if (!student) return;
    
    document.getElementById('confirm-modal-title').textContent = 'Confirmar Restauração';
    document.getElementById('confirm-modal-body').textContent = 
        `Tem certeza que deseja restaurar o aluno "${student.name}"?`;
    document.getElementById('confirm-action-btn').className = 'btn btn-success';
    document.getElementById('confirm-action-btn').textContent = 'Restaurar';
    
    confirmCallback = () => restoreStudent(id);
    confirmModal.show();
}

// Restaurar aluno
async function restoreStudent(id) {
    try {
        await api.restoreStudent(id);
        showAlert('Aluno restaurado com sucesso!', 'success');
        loadInactiveStudents();
    } catch (error) {
        showAlert(error.message, 'danger');
        console.error('Erro ao restaurar aluno:', error);
    }
}