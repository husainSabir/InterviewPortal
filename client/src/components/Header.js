import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';

import Container from 'react-bootstrap/Container';

function Header() {
  return (
    <Navbar>
    <Container>
      <Navbar.Brand href="/">Interview Portal</Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <Nav.Link className="navmargin" href="/upcoming"><Button variant="primary">Upcoming Interviews</Button></Nav.Link>
        <Nav.Link href="/schedule"><Button variant="success">Schedule Interviews</Button></Nav.Link>
      </Navbar.Collapse>
    </Container>
    </Navbar>
  )
}

export default Header
