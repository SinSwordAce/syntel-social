// script.js

// 1. Wait until the HTML is fully parsed
document.addEventListener('DOMContentLoaded', () => {
  // 2. Grab references to our form and input fields
  const form      = document.getElementById('loginForm');
  const email     = document.getElementById('email');
  const password  = document.getElementById('password');
  const emailErr  = document.getElementById('emailError');
  const passErr   = document.getElementById('passwordError');

  // 3. Listen for form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();      // stop normal form POST
    clearErrors();           // clear any previous error messages

    // 4. Optional pre-validation (you can skip this, and let Firebase handle invalid formats)
    let valid = true;
    if (!email.value) {
      showError(emailErr, 'Email is required.');
      valid = false;
    } else if (!validateEmail(email.value)) {
      showError(emailErr, 'Please enter a valid email address.');
      valid = false;
    }

    if (!password.value) {
      showError(passErr, 'Password is required.');
      valid = false;
    } else if (password.value.length < 6) {
      showError(passErr, 'Password must be at least 6 characters.');
      valid = false;
    }

    if (!valid) return;      // stop if local checks fail

    // 5. Attempt Firebase sign-in
    try {
      await firebase
        .auth()
        .signInWithEmailAndPassword(email.value, password.value);

      // 6. On success, you can redirect or show a message
      alert('Logged in successfully!');
      form.reset();
      // window.location.href = '/feed.html'; // example redirect

    } catch (err) {
      // 7. Handle common Firebase errors
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          showError(passErr, 'Invalid email or password.');
          break;
        case 'auth/invalid-email':
          showError(emailErr, 'Email address is malformed.');
          break;
        case 'auth/user-disabled':
          showError(emailErr, 'This account has been disabled.');
          break;
        default:
          alert(err.message);  // fallback for other errors
      }
    }
  });

  // 8. Optionally, monitor auth state changes (auto-fires on sign-in/out)
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      console.log('User signed in:', user.email);
      // e.g. display their name in header, enable logout button, etc.
    } else {
      console.log('No user signed in.');
      // e.g. hide protected content
    }
  });

  // --- Helper functions ---

  // Show an inline error message under a form field
  function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
  }

  // Clear all inline errors
  function clearErrors() {
    [emailErr, passErr].forEach(err => {
      err.textContent = '';
      err.style.display = 'none';
    });
  }

  // Simple regex to catch obvious mis-formats
  function validateEmail(addr) {
    return /\S+@\S+\.\S+/.test(addr);
  }
});