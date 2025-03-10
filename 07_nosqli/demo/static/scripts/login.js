function handleLogin() {
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    const email = emailField.value;
    const password = passwordField.value;

    fetch ("http://localhost:9000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email,
            password: password
        }),
    })
    .then((response) => response.json())
    .then((result) => {
        if(result.message === "Success") {
            errorMessage.innerHTML = 'You are logged in.';
        } else {
            errorMessage.innerHTML = 'Please check your login information.';
        }
    });
}
