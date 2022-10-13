import React from 'react'
import Container from 'react-bootstrap/Container';
import "./HomePage.css"

function HomePage() {
  return (<>

    <Container fluid>
      <h2 class="mt-100" style={{ textAlign: "center" }}>  Welcome! <br />
        To The Interview Portal</h2>
      <div className="boxContainer">
        <div> 
          A React application where users can schedule new interviews by selected date and time.
          <ul>
            <li>Schedule new interviews by selecting users</li>
            <li>View all upcoming interviews</li>
            <li>Edit interview details</li>
            <li>Backend using mongoose, express for storing interviews, user details. </li>
          </ul>
        </div>
      </div>

    </Container>
  </>
  )
}

export default HomePage;
