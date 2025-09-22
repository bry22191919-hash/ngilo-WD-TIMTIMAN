import React, { useEffect, useState } from 'react';
import GenerateLink from './GenerateLink';
import Message from './Message';


export function Home() {
    const [greeting, setGreeting] = useState('');
    const [username, setUsername] = useState('User');
    const [showComponent, setShowComponent] = useState(null);

    useEffect(()  => {
        const hour = new Date().getHours();
        setGreeting(
            hour < 12 ? 'Good Morning' :
            hour < 18 ? 'Good Afternoon' :
            'Good Evening'
        );

        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.userId) {
            fetch(`http://localhost:3001/api/user/${storedUser.userId}`)
                .then((res) => {
                    if (!res.ok) throw new Error('Failed to fetch user');
                    return res.json();
                })
                .then((data) => setUsername(data.username))
                .catch(() => {
                    setUsername(storedUser.username || 'User');
                });
        }
    },[]);

    return (
        <div style={{ padding: '2rem', textAlign: 'center'}}>
            <h1>{greeting}, {username}!</h1>
            <p>What would you like to do?</p>

            <button
                onClick={() => setShowComponent('message')}
                style={{ marginRight: '1rem', padding: '10px 20px'}}
            >
                Send Anonymous Message         
            </button>

            <button
                onClick={() => setShowComponent('generate')}
                style={{ padding: '10px 20px'}}
            >
                Generate Link
            </button>

            <div className="user-msg" style={{ marginTop: '2rem'}}>
                {showComponent === 'generate' && <GenerateLink />}
                {showComponent === 'message' && <Message />}
            </div>
        </div>
    );
}

export default Home;