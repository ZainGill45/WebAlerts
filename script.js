const confirmConfirmationDialogButton = document.getElementById('confirmConfirmationDialog');
const closeConfirmationDialogButton = document.getElementById('closeConfirmationDialog');
const closeAlertDialogButton = document.getElementById('closeAlertDialog');
const openAlertDialogButton = document.getElementById('openAlertDialogButton');
const openConfirmationDialogButton = document.getElementById('openConfirmationDialogButton');

let bodyScrollLockCount = 0;
let originalBodyOverflow = null;
let originalBodyPaddingRight = null;

function disableBodyScroll()
{
  if (bodyScrollLockCount === 0)
  {
    originalBodyOverflow = document.body.style.overflow;
    originalBodyPaddingRight = document.body.style.paddingRight;

    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';

    if (scrollBarWidth > 0)
    {
      const existing = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${existing + scrollBarWidth}px`;
    }
  }
  bodyScrollLockCount++;
}
function enableBodyScroll()
{
  if (bodyScrollLockCount <= 0) return;

  bodyScrollLockCount--;

  if (bodyScrollLockCount === 0)
  {
    if (originalBodyOverflow !== null)
    {
      document.body.style.overflow = originalBodyOverflow;
    } else
    {
      document.body.style.removeProperty('overflow');
    }

    if (originalBodyPaddingRight !== null && originalBodyPaddingRight !== '')
    {
      document.body.style.paddingRight = originalBodyPaddingRight;
    } else
    {
      document.body.style.removeProperty('padding-right');
    }

    originalBodyOverflow = null;
    originalBodyPaddingRight = null;
  }
}

function toggleDialog(dialogId, dialogText = "", fadeTime = 200)
{
  const dialog = document.getElementById(dialogId);

  if (!dialog)
  {
    console.error(`Could not find dialog id of ${dialog}`);
    alert(`Could not find dialog id of ${dialog}`);
    return;
  }

  if (dialog.animation && dialog.animation.playState === 'running')
    return;

  const hidden = window.getComputedStyle(dialog).opacity == 0;

  const keyframes = hidden ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }];

  if (hidden)
  {
    dialog.style.zIndex = '100';
    dialog.style.pointerEvents = 'auto';
    dialog.querySelector("p").textContent = dialogText;
    disableBodyScroll();
  } else
  {
    dialog.style.pointerEvents = 'none';
  }

  dialog.animation = dialog.animate(keyframes, {
    duration: fadeTime,
    easing: 'ease-out',
    fill: 'forwards'
  });

  dialog.animation.finished.then(() =>
  {
    if (!hidden)
    {
      dialog.style.zIndex = '-100';
      dialog.style.pointerEvents = 'none';
      dialog.querySelector("p").textContent = dialogText;
      enableBodyScroll();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
    openAlertDialogButton.addEventListener('click', () => {
        toggleDialog('alertDialog', 'This is simple alert dialog that can be used to alert the user of anything big or small.');
    });
    closeAlertDialogButton.addEventListener('click', () => {
        toggleDialog('alertDialog');
    });
    openConfirmationDialogButton.addEventListener('click', () => {
        toggleDialog('confirmationDialog', 'This is confirmation dialog that can be used to confirm that the user is absouluty sure of the action they are about to commit to.')
    });
    closeConfirmationDialogButton.addEventListener('click', () => {
        toggleDialog('confirmationDialog');
    });
    confirmConfirmationDialogButton.addEventListener('click', () => {
        toggleDialog('confirmationDialog');
    });
});