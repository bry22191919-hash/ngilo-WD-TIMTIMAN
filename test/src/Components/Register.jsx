import { useState } from "react";
import axios from 'axios';
import { Link } from "react-router-dom";


const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:3001/api/signup', {username, password});
        alert('Signup successful! Your ID: ' + res.data.userId);
        } catch (err) {
        alert('Signup failed: ' + err.response.data);
        }
    };
    return(
        <div>
            <div className='ngilo-user'>
                <div className="user-login">
                    <h2 className="SignUp">Sign Up</h2>
                    <form onSubmit={handleSignup}>
                        <label>Username</label>
                        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}/>
                        <label>Password</label>
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                        <button className="signupbtn" type="submit">Sign Up</button>
                    </form>

                    <Link to={"/Login"} className="linkLogin"> Log In </Link>

                </div>
            </div>
        </div>
    )
    }
export default Register