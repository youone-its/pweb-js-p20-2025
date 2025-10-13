let registeredUsers = [];
function toggleForms(formType) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    document.querySelectorAll('.message').forEach(msg => {
        msg.classList.remove('show');
        msg.textContent = '';
    });

    if (formType === 'register') {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    } else {
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
    }
}

function showMessage(elementId, message) {
    const messageEl = document.getElementById(elementId);
    messageEl.textContent = message;
    messageEl.classList.add('show');
    
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 5000);
}

async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const buttonText = document.getElementById('loginButtonText');
    const loader = document.getElementById('loginLoader');
    const loginBtn = document.getElementById('loginBtn');

    document.getElementById('loginError').classList.remove('show');
    document.getElementById('loginSuccess').classList.remove('show');

    buttonText.style.opacity = '0.5';
    loader.classList.add('active');
    loginBtn.disabled = true;

    try {
        const response = await fetch('https://dummyjson.com/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password,
                expiresInMins: 30
            })
        });

        const data = await response.json();

        if (response.ok) {
            buttonText.style.opacity = '1';
            loader.classList.remove('active');
            loginBtn.disabled = false;
            
            showMessage('loginSuccess', `Welcome back, ${data.firstName}! (API User)`);
            
            window.currentUser = {
                ...data,
                source: 'api'
            };
            
            setTimeout(() => {
                console.log('Login successful (API):', window.currentUser);
                window.location.href = 'recipes.html';
            }, 1500);
            return;
        }
    } catch (error) {
        console.log('API login failed, checking registered users...', error);
    }

    const registeredUser = registeredUsers.find(
        user => user.username === username && user.password === password
    );

    buttonText.style.opacity = '1';
    loader.classList.remove('active');
    loginBtn.disabled = false;

    if (registeredUser) {
        showMessage('loginSuccess', `Welcome back, ${registeredUser.firstName}! (Registered User)`);
        
        window.currentUser = {
            ...registeredUser,
            source: 'registered',
            token: 'local-token-' + Date.now()
        };
        
        setTimeout(() => {
            console.log('Login successful (Registered):', window.currentUser);
            window.location.href = 'recipes.html';
        }, 1500);
    } else {
        showMessage('loginError', 'Invalid username or password. Please try again or create an account.');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('registerFirstName').value;
    const lastName = document.getElementById('registerLastName').value;
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const buttonText = document.getElementById('registerButtonText');
    const loader = document.getElementById('registerLoader');
    const registerBtn = document.getElementById('registerBtn');

    document.getElementById('registerError').classList.remove('show');
    document.getElementById('registerSuccess').classList.remove('show');

    const usernameExists = registeredUsers.some(user => user.username === username);
    if (usernameExists) {
        showMessage('registerError', 'Username already exists. Please choose another one.');
        return;
    }

    const emailExists = registeredUsers.some(user => user.email === email);
    if (emailExists) {
        showMessage('registerError', 'Email already registered. Please use another email.');
        return;
    }

    buttonText.style.opacity = '0.5';
    loader.classList.add('active');
    registerBtn.disabled = true;

    setTimeout(() => {
        const newUser = {
            id: Date.now(),
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        };

        registeredUsers.push(newUser);

        buttonText.style.opacity = '1';
        loader.classList.remove('active');
        registerBtn.disabled = false;

        showMessage('registerSuccess', `Account created successfully! Welcome, ${firstName}!`);
        
        console.log('Registration successful:', { ...newUser, password: '***hidden***' });
        console.log('Total registered users:', registeredUsers.length);
        
        setTimeout(() => {
            toggleForms('login');
            document.getElementById('loginUsername').value = username;
            showMessage('loginSuccess', 'Please login with your new account!');
        }, 1000);
    }, 1000);
}

// di form.js
function goToRecipes() {
  window.location.href = "recipes.html";
}
