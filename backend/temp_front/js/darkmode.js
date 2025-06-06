// js/dark-mode.js

(() => {
    'use strict'

    const getStoredTheme = () => localStorage.getItem('theme')
    const setStoredTheme = theme => localStorage.setItem('theme', theme)

    const getPreferredTheme = () => {
        const storedTheme = getStoredTheme()
        if (storedTheme) {
            return storedTheme
        }

        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    const setTheme = theme => {
        if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-bs-theme', 'dark')
        } else {
            document.documentElement.setAttribute('data-bs-theme', theme)
        }
    }

    const showActiveTheme = (theme, focus = false) => {
        const themeSwitcher = document.querySelector('#bd-theme')

        if (!themeSwitcher) {
            return
        }

        const themeSwitcherText = document.querySelector('#bd-theme-text')
        const themeSwitcherIcon = document.querySelector('#bd-theme-icon')
        const activeThemeIcon = document.querySelector('.dropdown-menu .active .bi-check-lg')
        const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`)
        const iconOfActiveBtn = btnToActive.querySelector('i.bi:not(.bi-check-lg)') // Pega o ícone certo

        document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
            element.classList.remove('active')
            element.setAttribute('aria-pressed', 'false')
            element.querySelector('.bi-check-lg').classList.add('d-none');
        })

        btnToActive.classList.add('active')
        btnToActive.setAttribute('aria-pressed', 'true')
        btnToActive.querySelector('.bi-check-lg').classList.remove('d-none');

        // Atualiza o ícone do botão principal
        const iconClass = iconOfActiveBtn.classList.value.replace(' me-2', ''); // Pega a classe do ícone ativo
        themeSwitcherIcon.className = `bi ${iconClass}`; // Define a classe do ícone principal
        
        if (themeSwitcherText) {
             themeSwitcherText.textContent = btnToActive.textContent.trim();
        }

        if (focus) {
            themeSwitcher.focus()
        }
    }

    // Aplica o tema ao carregar
    setTheme(getPreferredTheme())
    showActiveTheme(getPreferredTheme())

    // Listener para mudança de preferência do sistema (caso esteja em 'auto')
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const storedTheme = getStoredTheme()
        if (storedTheme !== 'light' && storedTheme !== 'dark') {
            setTheme(getPreferredTheme())
        }
    })

    // Listener para os botões do dropdown
    window.addEventListener('DOMContentLoaded', () => {
        showActiveTheme(getPreferredTheme())

        document.querySelectorAll('[data-bs-theme-value]')
            .forEach(toggle => {
                toggle.addEventListener('click', () => {
                    const theme = toggle.getAttribute('data-bs-theme-value')
                    setStoredTheme(theme)
                    setTheme(theme)
                    showActiveTheme(theme, true)
                })
            })
    })
})()