/**
 * Модуль доступности для ProGame с поддержкой PHP
 */
class AccessibilityMode {
    constructor() {
        this.panel = document.querySelector('.accessibility-panel');
        this.settings = {};
        this.ajaxUrl = '/accessibility/save_settings.php';
        this.csrfToken = document.getElementById('csrf_token')?.value || '';
        this.saveTimeout = null;
        
        this.init();
    }
    
    init() {
        // Загружаем начальные настройки из PHP
        const initialSettings = this.panel?.dataset.initialSettings;
        if (initialSettings) {
            try {
                this.settings = JSON.parse(initialSettings);
            } catch (e) {
                console.error('Ошибка парсинга настроек:', e);
            }
        }
        
        this.getElements();
        this.bindEvents();
        this.updateActiveButtons();
    }
    
    getElements() {
        this.toggleBtn = document.querySelector('.panel-toggle');
        this.closeBtn = document.querySelector('.settings-close');
        this.settingsBtns = document.querySelectorAll('.settings-btn');
        this.resetBtn = document.querySelector('.settings-reset');
        this.checkboxes = document.querySelectorAll('.setting-checkbox');
        this.statusDiv = document.querySelector('.settings-status');
        this.statusMessage = document.querySelector('.status-message');
    }
    
    bindEvents() {
        // Открытие панели
        this.toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.panel.classList.toggle('active');
        });
        
        // Закрытие панели
        this.closeBtn?.addEventListener('click', () => {
            this.panel.classList.remove('active');
        });
        
        // Закрытие при клике вне панели
        document.addEventListener('click', (e) => {
            if (this.panel && !this.panel.contains(e.target)) {
                this.panel.classList.remove('active');
            }
        });
        
        // Обработчики кнопок
        this.settingsBtns?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (btn.classList.contains('font-size-normal')) {
                    this.updateSetting('fontSize', 'normal');
                } else if (btn.classList.contains('font-size-large')) {
                    this.updateSetting('fontSize', 'large');
                } else if (btn.classList.contains('font-size-xlarge')) {
                    this.updateSetting('fontSize', 'xlarge');
                } else if (btn.classList.contains('color-scheme-default')) {
                    this.updateSetting('colorScheme', 'default');
                } else if (btn.classList.contains('color-scheme-dark')) {
                    this.updateSetting('colorScheme', 'dark');
                } else if (btn.classList.contains('color-scheme-light')) {
                    this.updateSetting('colorScheme', 'light');
                } else if (btn.classList.contains('color-scheme-blue')) {
                    this.updateSetting('colorScheme', 'blue');
                } else if (btn.classList.contains('spacing-normal')) {
                    this.updateSetting('spacing', 'normal');
                } else if (btn.classList.contains('spacing-wide')) {
                    this.updateSetting('spacing', 'wide');
                } else if (btn.classList.contains('spacing-xwide')) {
                    this.updateSetting('spacing', 'xwide');
                } else if (btn.classList.contains('font-normal')) {
                    this.updateSetting('fontFamily', 'normal');
                } else if (btn.classList.contains('font-serif')) {
                    this.updateSetting('fontFamily', 'serif');
                }
            });
        });
        
        // Чекбоксы
        this.checkboxes?.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const setting = e.target.dataset.setting;
                this.updateSetting(setting, e.target.checked);
            });
        });
        
        // Сброс настроек
        this.resetBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.resetSettings();
        });
        
        // Клавиатурная навигация
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                this.panel?.classList.toggle('active');
            }
            if (e.key === 'Escape') {
                this.panel?.classList.remove('active');
            }
        });
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        this.applySettings();
        this.updateActiveButtons();
        this.debounceSave();
    }
    
    applySettings() {
        const body = document.body;
        const classes = [
            'accessibility-large',
            'accessibility-xlarge',
            'accessibility-dark',
            'accessibility-light',
            'accessibility-blue',
            'accessibility-wide',
            'accessibility-xwide',
            'accessibility-serif',
            'accessibility-underline-links',
            'accessibility-big-cursor',
            'accessibility-hide-images'
        ];
        
        // Удаляем все классы
        classes.forEach(cls => body.classList.remove(cls));
        
        // Применяем новые
        if (this.settings.fontSize === 'large') body.classList.add('accessibility-large');
        if (this.settings.fontSize === 'xlarge') body.classList.add('accessibility-xlarge');
        
        if (this.settings.colorScheme === 'dark') body.classList.add('accessibility-dark');
        if (this.settings.colorScheme === 'light') body.classList.add('accessibility-light');
        if (this.settings.colorScheme === 'blue') body.classList.add('accessibility-blue');
        
        if (this.settings.spacing === 'wide') body.classList.add('accessibility-wide');
        if (this.settings.spacing === 'xwide') body.classList.add('accessibility-xwide');
        
        if (this.settings.fontFamily === 'serif') body.classList.add('accessibility-serif');
        
        if (this.settings.underlineLinks) body.classList.add('accessibility-underline-links');
        if (this.settings.bigCursor) body.classList.add('accessibility-big-cursor');
        if (this.settings.hideImages) body.classList.add('accessibility-hide-images');
    }
    
    updateActiveButtons() {
        // Обновляем кнопки
        this.settingsBtns?.forEach(btn => btn.classList.remove('active'));
        
        const sizeBtn = document.querySelector(`.font-size-${this.settings.fontSize}`);
        if (sizeBtn) sizeBtn.classList.add('active');
        
        const schemeBtn = document.querySelector(`.color-scheme-${this.settings.colorScheme}`);
        if (schemeBtn) schemeBtn.classList.add('active');
        
        const spacingBtn = document.querySelector(`.spacing-${this.settings.spacing}`);
        if (spacingBtn) spacingBtn.classList.add('active');
        
        const fontBtn = document.querySelector(`.font-${this.settings.fontFamily}`);
        if (fontBtn) fontBtn.classList.add('active');
        
        // Обновляем чекбоксы
        this.checkboxes?.forEach(checkbox => {
            const setting = checkbox.dataset.setting;
            checkbox.checked = this.settings[setting] || false;
        });
    }
    
    debounceSave() {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => this.saveSettings(), 500);
    }
    
    async saveSettings() {
        try {
            const formData = new FormData();
            formData.append('action', 'save');
            formData.append('settings', JSON.stringify(this.settings));
            formData.append('csrf_token', this.csrfToken);
            
            const response = await fetch(this.ajaxUrl, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showStatus('Настройки сохранены', 'success');
            } else {
                this.showStatus('Ошибка сохранения', 'error');
            }
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
            this.showStatus('Ошибка соединения', 'error');
        }
    }
    
    async resetSettings() {
        try {
            const formData = new FormData();
            formData.append('action', 'reset');
            formData.append('csrf_token', this.csrfToken);
            
            const response = await fetch(this.ajaxUrl, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.settings = result.settings;
                this.applySettings();
                this.updateActiveButtons();
                this.showStatus('Настройки сброшены', 'success');
            }
        } catch (error) {
            console.error('Ошибка при сбросе:', error);
        }
    }
    
    showStatus(message, type) {
        if (this.statusDiv && this.statusMessage) {
            this.statusMessage.textContent = message;
            this.statusDiv.className = `settings-status ${type}`;
            this.statusDiv.style.display = 'block';
            
            setTimeout(() => {
                this.statusDiv.style.display = 'none';
            }, 3000);
        }
    }
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new AccessibilityMode();
});
