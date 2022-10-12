import logo from './logo.svg';
// default
import './App.css';
import React from 'react';
import Container from 'react-bootstrap/Container';
// Schedule Interview
import ScheduleInterview from './pages/ScheduleInterview';
// Header
import Header from './components/Header';
import HomePage from './pages/HomePage';

// React router DOM
import { BrowserRouter,Routes, Route, Link } from 'react-router-dom';

import UpcomingInterview from './pages/UpcomingInterview'
import EditInterview from './pages/EditPage';

function App() {
  return (
   <>
    {/* <Header/> */}
    {/* <HomePage/> */}
   {/* <ScheduleInterview/> */}

   <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/schedule" element={<ScheduleInterview />} />
          <Route path="/upcoming" element={<UpcomingInterview />} />
          <Route path="/edit/:interviewId" element={<EditInterview />} />
        </Routes>
      </BrowserRouter>


    
   </>
  );
}

export default App;
