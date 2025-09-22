import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import { Home } from './Components/Home';
import Login from './Components/Login'
import Register from './Components/Register'



function App() {
  return (
   <Router>
    <Routes>
      <Route path='/' element={<Login/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/Register' element={<Register/>}/>
      <Route path='/Home' element={<Home/>}/>
    </Routes>
   </Router>
  );
}

export default App;
