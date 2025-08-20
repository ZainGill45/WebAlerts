import { createAlert, createConfirmationAlert } from './dialog.js';

document.addEventListener('DOMContentLoaded', () => {
    const simpleAlertBtn = document.getElementById('simpleAlertBtn');
    simpleAlertBtn.addEventListener('click', () => {
        createAlert('Simple Alert', 'This is a basic alert message.');
    });

    const basicConfirmationBtn = document.getElementById('basicConfirmationBtn');
    basicConfirmationBtn.addEventListener('click', () => {
        createConfirmationAlert('Confirm Action', 'Are you sure you want to proceed?', () => {
            console.log('User confirmed the action!');
            createAlert('Success', 'Action completed successfully!');
        });
    });

    const dangerousActionBtn = document.getElementById('dangerousActionBtn');
    dangerousActionBtn.addEventListener('click', () => {
        createConfirmationAlert('Delete Everything?', 'This action cannot be undone. Are you absolutely sure?', () => {
            console.log('Dangerous action confirmed!');
            createAlert('Deleted', 'Everything has been deleted!');
        },
            {
                confirmText: 'Delete',
                confirmClassName: 'buttonDanger'
            }
        );
    });

    // Stack Dialogs Button
    const stackDialogsBtn = document.getElementById('stackDialogsBtn');
    stackDialogsBtn.addEventListener('click', () => {
        createAlert('First Dialog', 'This is the first dialog in the stack.');

        setTimeout(() => {
            createConfirmationAlert(
                'Second Dialog',
                'This is stacked on top. Confirm to add another?',
                () => {
                    createAlert('Third Dialog', 'This is the third dialog! You can stack as many as needed.');
                }
            );
        }, 500);
    });

    // Custom Confirmation Button
    const customConfirmationBtn = document.getElementById('customConfirmationBtn');
    customConfirmationBtn.addEventListener('click', () => {
        createConfirmationAlert(
            'Custom Callback',
            'This confirmation has a custom callback that shows another dialog.',
            () => {
                const shouldContinue = Math.random() > 0.5;
                if (shouldContinue) {
                    createAlert('Random Success', 'The random check passed!');
                } else {
                    createAlert('Random Failure', 'The random check failed. Try again!');
                }
            },
            {
                confirmText: 'Try Random Check',
                confirmClassName: 'buttonPrimary'
            }
        );
    });

    // Long Alert Button
    const longAlertBtn = document.getElementById('longAlertBtn');
    longAlertBtn.addEventListener('click', () => {
        const longMessage = 'This is a much longer alert message that demonstrates how the dialog handles more text content. It should wrap properly and maintain good readability even with extended content. The dialog system is flexible and can handle various content lengths while maintaining a clean, professional appearance.';

        createAlert('Long Content Alert', longMessage, {
            closeText: 'Got it!',
            closeClassName: 'buttonPrimary'
        });
    });
});