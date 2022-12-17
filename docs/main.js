let contrastToggle = false;

function toggleContrast() {
  contrastToggle = !contrastToggle;
  if (contrastToggle) {
    document.body.classList += ' dark-theme';
  } else {
    document.body.classList.remove('dark-theme');
  }
}

function inProgress() {
  alert('This feature is currently in progress. Please try again later.');
}
