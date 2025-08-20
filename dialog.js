class DialogManager {
    constructor() {
        this.dialogStack = [];
        this.dialogCounter = 0;
        this.bodyScrollLockCount = 0;
        this.originalBodyOverflow = null;
        this.originalBodyPaddingRight = null;
        this.baseZIndex = 1000;
    }

    disableBodyScroll() {
        if (this.bodyScrollLockCount === 0) {
            this.originalBodyOverflow = document.body.style.overflow;
            this.originalBodyPaddingRight = document.body.style.paddingRight;

            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';

            if (scrollBarWidth > 0) {
                const existing = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
                document.body.style.paddingRight = `${existing + scrollBarWidth}px`;
            }
        }
        this.bodyScrollLockCount++;
    }

    enableBodyScroll() {
        if (this.bodyScrollLockCount <= 0) return;

        this.bodyScrollLockCount--;

        if (this.bodyScrollLockCount === 0) {
            if (this.originalBodyOverflow !== null) {
                document.body.style.overflow = this.originalBodyOverflow;
            } else {
                document.body.style.removeProperty('overflow');
            }

            if (this.originalBodyPaddingRight !== null && this.originalBodyPaddingRight !== '') {
                document.body.style.paddingRight = this.originalBodyPaddingRight;
            } else {
                document.body.style.removeProperty('padding-right');
            }

            this.originalBodyOverflow = null;
            this.originalBodyPaddingRight = null;
        }
    }

    createDialog(title, message, buttons, options = {}) {
        const dialogId = `dialog-${++this.dialogCounter}`;
        const stackLevel = this.dialogStack.length + 1;
        const zIndex = this.baseZIndex + stackLevel;

        // Create dialog HTML with Tailwind classes
        const dialogWrapper = document.createElement('div');

        dialogWrapper.className = 'fixed inset-0 bg-black/50 flex justify-center items-center opacity-0 pointer-events-none transition-opacity duration-200';
        dialogWrapper.id = dialogId;
        dialogWrapper.style.zIndex = zIndex;

        // Button styling based on type
        const getButtonClasses = (type, customClass) => {
            const baseClasses = 'w-full px-4 py-3 mt-4 text-center border border-gray-300 cursor-pointer select-none rounded-md text-base transition-all duration-200 ease-out  focus:scale-98';
            
            if (customClass) return `${baseClasses} ${customClass}`;
            
            switch (type) {
                case 'primary':
                    return `${baseClasses} bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 active:bg-blue-800`;
                case 'danger':
                    return `${baseClasses} bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700 active:bg-red-800`;
                default:
                    return `${baseClasses} bg-gray-50 hover:bg-white hover:border-blue-600 active:bg-white`;
            }
        };

        const buttonGroupClass = buttons.length > 1 ? 'flex gap-4' : '';
        const buttonsHtml = buttons.map(btn => {
            const buttonType = btn.className?.includes('buttonPrimary') ? 'primary' : btn.className?.includes('buttonDanger') ? 'danger' : 'default';
            const buttonClasses = getButtonClasses(buttonType, btn.customClasses);
            return `<button type="button" class="${buttonClasses}" data-action="${btn.action}">${btn.text}</button>`;
        }).join('');

        const stackIndicator = options.showStackIndicator !== false && stackLevel > 1
            ? `<div class="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-bold">${stackLevel}/${stackLevel}</div>`
            : '';

        dialogWrapper.innerHTML = `
            <div class="bg-white p-7 rounded-2xl shadow-2xl w-full max-w-md mx-4 text-center text-gray-900 transform scale-90 transition-transform duration-200">
                ${stackIndicator}
                <h2 class="text-2xl font-semibold mb-4">${title}</h2>
                <p class="mb-6 text-gray-600">${message}</p>
                <div class="${buttonGroupClass}">
                    ${buttonsHtml}
                </div>
            </div>
        `;

        document.body.appendChild(dialogWrapper);

        // Add event listeners to buttons
        const buttonElements = dialogWrapper.querySelectorAll('button[data-action]');
        buttonElements.forEach(btn => {
            const action = btn.getAttribute('data-action');
            const buttonConfig = buttons.find(b => b.action === action);

            btn.addEventListener('click', () => {
                if (buttonConfig.callback) {
                    const result = buttonConfig.callback();
                    // If callback returns false, don't close the dialog
                    if (result === false) return;
                }
                this.closeDialog(dialogId);
            });
        });

        // Handle escape key for top dialog
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && this.dialogStack[this.dialogStack.length - 1]?.id === dialogId) {
                if (options.allowEscapeClose !== false) {
                    this.closeDialog(dialogId);
                }
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Store dialog info
        const dialogInfo = {
            id: dialogId,
            element: dialogWrapper,
            escapeHandler,
            onClose: options.onClose
        };

        this.dialogStack.push(dialogInfo);
        this.disableBodyScroll();

        // Show dialog with animation
        requestAnimationFrame(() => {
            dialogWrapper.classList.remove('opacity-0', 'pointer-events-none');
            dialogWrapper.classList.add('opacity-100', 'pointer-events-auto');
            
            const dialogElement = dialogWrapper.querySelector('div');
            dialogElement.classList.remove('scale-90');
            dialogElement.classList.add('scale-100');
        });

        return dialogId;
    }

    closeDialog(dialogId) {
        const dialogIndex = this.dialogStack.findIndex(d => d.id === dialogId);
        if (dialogIndex === -1) return;

        const dialogInfo = this.dialogStack[dialogIndex];
        const { element, escapeHandler, onClose } = dialogInfo;

        // Remove escape handler
        document.removeEventListener('keydown', escapeHandler);

        // Animate out
        element.classList.remove('opacity-100', 'pointer-events-auto');
        element.classList.add('opacity-0', 'pointer-events-none');
        
        const dialogElement = element.querySelector('div');
        dialogElement.classList.remove('scale-100');
        dialogElement.classList.add('scale-90');

        setTimeout(() => {
            if (document.body.contains(element)) {
                document.body.removeChild(element);
            }
            this.enableBodyScroll();

            if (onClose) {
                onClose();
            }
        }, 200);

        // Remove from stack
        this.dialogStack.splice(dialogIndex, 1);

        // Update stack indicators
        this.updateStackIndicators();
    }

    updateStackIndicators() {
        this.dialogStack.forEach((dialog, index) => {
            const indicator = dialog.element.querySelector('.absolute.top-4.right-4');
            if (indicator) {
                const stackLevel = index + 1;
                const totalDialogs = this.dialogStack.length;
                indicator.textContent = `${stackLevel}/${totalDialogs}`;
            }
        });
    }

    showAlert(title, message, options = {}) {
        const buttons = [
            {
                text: options.closeText || 'Close',
                action: 'close',
                className: options.closeClassName || '',
                customClasses: options.closeCustomClasses || ''
            }
        ];
        return this.createDialog(title, message, buttons, options);
    }

    showConfirmation(title, message, onConfirm, options = {}) {
        const buttons = [
            {
                text: options.cancelText || 'Cancel',
                action: 'cancel',
                className: options.cancelClassName || '',
                customClasses: options.cancelCustomClasses || ''
            },
            {
                text: options.confirmText || 'Confirm',
                action: 'confirm',
                className: options.confirmClassName || 'buttonPrimary',
                customClasses: options.confirmCustomClasses || '',
                callback: onConfirm
            }
        ];
        return this.createDialog(title, message, buttons, options);
    }
}

const dialogManager = new DialogManager();

export function createAlert(title, message, options = {}) {
    return dialogManager.showAlert(title, message, options);
}

export function createConfirmationAlert(title, message, onConfirm, options = {}) {
    return dialogManager.showConfirmation(title, message, onConfirm, options);
}

export { DialogManager };