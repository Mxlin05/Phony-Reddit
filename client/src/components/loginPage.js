import { addUser, checkPassword } from "./asyncHelpers";
import { useState } from "react";
import { logIn } from "./asyncHelpers";


function WelcomePage({setLogin}){
    return (
        <div className = 'loginPage'>
            <h3>Welcome To Phreddit!</h3>
            <button className = "standard-button" onClick = {() => setLogin("login")}>Log In</button>
            <button className = "standard-button" onClick = {() => setLogin("signup")}>Sign Up</button>
            <button className = "standard-button" onClick = {() => setLogin("home")}>Continue as Guest</button>
        </div>
    );
}


function LoginPage({model, setLogin, setUserView, setAdmin}) {

    const [error, setError] = useState({});
    const handleLogIn = async (e) => {
        e.preventDefault();

        let foundErrors = {};
        let foundError = false;
        let foundName = false;

        const username = e.target.username.value;
        const password = e.target.password.value;

        
        if(username === undefined || username === null || username === "" || username.length < 1){
            foundErrors.usernameMissing = "username is required";
            foundError = true;
        }
        

        if(password === undefined || password === null || password === "" || password.length < 1){
            foundErrors.passwordMissing = "password is required";
            foundError = true;
        }

        if(foundError === true){
            setError(foundErrors);
            return;
        }
        for(let user of model.users) {

            if((user.username === username || user.email === username)){
                try {
                    const response = await checkPassword(user, password);
                    if (response.message === "correct password"){
                        setLogin("home");
                        const newUser = await logIn(user.username, password);
                        if (newUser.firstName === "Admin" && newUser.secondName === "Admin"){
                            setAdmin(newUser);
                        }
                        setUserView(newUser);
                        return;
                    }
                    else{
                        foundErrors.passwordError = "Password is incorrect";
                        foundError = true;
                        foundName = true;
                    }
                } catch (error) {
                    console.log(error);
                    }
                }
            }
        if(foundName === false){
            foundErrors.usernameError = 'Username or email does not exist';
            foundError = true;
        }

        if(foundError){
            setError(foundErrors);
            return;
        }
    }

    return (
        <div className = 'loginPage'>
            <button className = "close-button" onClick = {() => setLogin("welcome")}>X</button>
            <h3>Log In</h3>
            <form className = "loginForm" onSubmit={handleLogIn}>

                <input type="text" id="username" name="username" placeholder="Username or Email*"  />
                {error.usernameMissing && <p className = "error-message">{error.usernameMissing}</p>}
                {!error.usernameMissing && error.usernameError && <p className = "error-message">{error.usernameError}</p>}
                <br />

                <input type="password" id="password" name="password*" placeholder="Password" />
                {error.passwordMissing && <p className = "error-message">{error.passwordMissing}</p>}
                {!error.passwordMissing && error.passwordError && <p className = "error-message">{error.passwordError}</p>}
                <br />

                <button type="submit" className = "standard-button">Log In</button>
                <a href = '#' onClick = {(e) => {e.preventDefault(); setLogin("signup");}}>Dont have an account?</a>
                <h4>Forgot Password?</h4>
                <a href = '#' onClick = {(e) => {e.preventDefault(); setLogin("home");}}>Continue as a Guest?</a>
            
            </form>
        </div>
    );
}

function SignUp({model, setLogin, setModel}){

    const [error, setError] = useState({});


    const handleSignUp = (e) => {
        setError({});
        e.preventDefault();

        let foundErrors = {};
        let foundError = false;

        const firstName = e.target.firstName.value;
        const secondName = e.target.secondName.value;
        const email = e.target.email.value;
        const username = e.target.username.value;
        const firstPassword = e.target.firstPassword.value;
        const secondPassword = e.target.secondPassword.value;

        if(firstName === undefined || firstName === null || firstName === "" || firstName.length < 1){
            foundErrors.firstNameMissing = "First Name is required";
            foundError = true;
        }
        

        if(secondName === undefined || secondName === null || secondName === "" || secondName.length < 1){
            foundErrors.secondNameMissing = "Second Name is required";
            foundError = true;
        }
        

        if(email === undefined || email === null || email === "" || email.length < 1){
            foundErrors.emailMissing = "email is required";
            foundError = true;
        }
        

        if(username === undefined || username === null || username === "" || username.length < 1){
            foundErrors.usernameMissing = "username is required";
            foundError = true;
        }
        

        if(firstPassword === undefined || firstPassword === null || firstPassword === "" || firstPassword.length < 1){
            foundErrors.firstPasswordMissing = "Password is required";
            foundError = true;
        }
        
        if(secondPassword === undefined || secondPassword === null || secondPassword === "" || secondPassword.length < 1){
            foundErrors.secondPasswordMissing = "Password is required";
            foundError = true;
        }

        if (firstPassword !== secondPassword) {
            foundErrors.passErrorOne = "Passwords do not match";
            foundError = true;
        }

        if(firstPassword.includes(username) || 
           firstPassword.includes(email) ||  
           firstPassword.includes(firstName) || 
           firstPassword.includes(secondName)){
            foundErrors.passErrorTwo = "Passwords cannot contain personal information";
            foundError = true;
        }

        model.users.forEach((user) => {
            if (user.username === username) {
                foundErrors.userError = "username already taken";
                foundError = true;
            }
            if (user.email === email) {
                foundErrors.emailErrorOne = "Email already taken";
                foundError = true;
            }
        });

        const emailForm = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailForm.test(email)){
            foundErrors.emailErrorTwo = "Invalid Email";
            foundError = true;
        }
        if(foundError === true){
            console.log("dadsadasdasdada wat");
            setError(foundErrors);
            return;
        }

        const user = {
            firstName : firstName,
            secondName : secondName,
            email : email,
            username : username,
            password : firstPassword,
            createdAt : new Date(),
            communities : [],
            posts : [],
            comments : []
        };

        //add user
        addUser(user).then((response) => {
            setLogin('welcome');
            setModel((prevModel) => {
                return {
                    ...prevModel,
                    users : [...prevModel.users, response]
                }
            });
        }).catch((error) => {
            console.log("there was an error");
            console.log(error);
        })

    }
    return (
        <div className = 'loginPage'>
            <button className = "close-button" onClick = {() => setLogin("welcome")}>X</button>
            <h3>Sign Up</h3>
            <form className = "loginForm" onSubmit={handleSignUp}>

                <input type="firstName" id="firstName" name="firstName" placeholder="First Name*" />
                {error.firstNameMissing && <p className = "error-message">{error.firstNameMissing}</p>}
                <br />

                <input type="secondName" id="secondName" name="secondName" placeholder="Second Name*" />
                {error.secondNameMissing && <p className = "error-message">{error.secondNameMissing}</p>}
                <br />

                <input type="text" id="email" name="email" placeholder="Email*" />
                {error.emailMissing && <p className = 'error-message'>{error.emailMissing}</p>}
                {error.emailErrorOne && <p className = 'error-message'>{error.emailErrorOne}</p>}
                {!error.emailMissing && error.emailErrorTwo && <p className = 'error-message'>{error.emailErrorTwo}</p>}
                <br />

                <input type="text" id="username" name="username" placeholder="Username*" />
                {error.usernameMissing && <p className = "error-message">{error.usernameMissing}</p>}
                {error.userError && <p className = "error-message">{error.userError}</p>}
                <br />

                <input type="password" id="firstPassword" name="firstPassword" placeholder="Password*" />
                {error.firstPasswordMissing && <p className = "error-message">{error.firstPasswordMissing}</p>}
                {error.passErrorOne && <p className = "error-message">{error.passErrorOne}</p>}
                {!error.firstPasswordMissing && error.passErrorTwo && <p className = "error-message">{error.passErrorTwo}</p>}
                <br />

                <input type="password" id="secondPassword" name="secondPassword" placeholder="Verify Password*" />
                {error.secondPasswordMissing && <p className = "error-message">{error.secondPasswordMissing}</p>}
                {error.passErrorOne && <p className = "error-message">{error.passErrorOne}</p>}
                {!error.secondPasswordMissing && error.passErrorTwo && <p className = "error-message">{error.passErrorTwo}</p>}
                <br />

                <button type="submit" className = "standard-button">Sign Up</button>
                <a href = '#' onClick = {(e) => {e.preventDefault(); setLogin("login");}}>Have an account?</a>
                <a href = '#' onClick = {(e) => {e.preventDefault(); setLogin("home");}}>Continue as a Guest?</a>

            </form>
        </div>
    );
}


// function handleLogIn(){

// }

// function handleSignUp(){

// }

export { WelcomePage, LoginPage, SignUp };
