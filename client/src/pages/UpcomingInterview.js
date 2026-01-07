import React from 'react'
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import { useState, useEffect } from 'react';
import "./UpcomingInterview.css"
import moment from "moment"

function UpcomingInterview() {

    const [items, setItems] = useState([]);

    async function fetchdata() {
        try {
            let res = await fetch("http://localhost:8000/api/interviews/upcoming", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            let data = await res.json();
            setItems(data);
        } catch (err) {
            console.error("Error fetching interviews:", err);
        }
    }

    async function deleteHandler(id) {
        if (!window.confirm("Are you sure you want to delete this interview?")) {
            return;
        }
        try {
            let res = await fetch(`http://localhost:8000/api/interviews/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            let data = await res.json();
            if (res.status === 200) {
                alert("Interview deleted successfully");
                fetchdata(); // Refresh the list
            } else {
                alert(data.message || "Failed to delete interview");
            }
        } catch (err) {
            console.error("Error deleting interview:", err);
            alert("Error deleting interview");
        }
    }

    useEffect(() => {
        fetchdata();
    }, []);
    return (
        <>
            <h2 className="head">Upcoming Interviews Details</h2>
            <Container className="mainContainer" >
                {
                    items.interviews && items.interviews.length > 0 ? (
                        items.interviews.map((currElem) => {
                            return ( 
                                    <Card key={currElem._id} className="mainCard">
                                        <Card.Body>
                                            <Card.Title>{currElem.title || "Untitled Interview"}</Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">{currElem.role + " - " + currElem.companyName || "No role specified"}</Card.Subtitle>
                                            <Card.Text>
                                                <p><strong>Start Time:</strong> {moment(currElem.startTime).format('MMMM Do YYYY, h:mm a')}</p>
                                                <p><strong>End Time:</strong> {moment(currElem.endTime).format('MMMM Do YYYY, h:mm a')}</p>
                                                <p>
                                                    <strong>Participants:</strong>
                                                    <ul>
                                                        {
                                                            currElem.usersInvited && currElem.usersInvited.length > 0 ? (
                                                                currElem.usersInvited.map((email, index) => {
                                                                    return (
                                                                        <li key={index}>
                                                                            {email}
                                                                        </li>
                                                                    )
                                                                })
                                                            ) : (
                                                                <li>No participants</li>
                                                            )
                                                        }
                                                    </ul>
                                                </p>
                                            </Card.Text>
                                            <Card.Link href={`/edit/${currElem._id}`}><button type="button" className="btn btn-outline-secondary">Edit</button></Card.Link>

                                            <Card.Link href={"/upcoming"}> <button type="button" onClick={() => deleteHandler(currElem._id)} className="btn btn-outline-danger">Delete</button></Card.Link>
                                        </Card.Body>
                                    </Card> 
                            )
                        })
                    ) : (
                        <div style={{ textAlign: "center", padding: "20px" }}>
                            <p>No upcoming interviews scheduled.</p>
                        </div>
                    )
                }
            </Container>
        </>
    )
}

export default UpcomingInterview
