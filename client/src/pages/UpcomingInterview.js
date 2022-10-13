import React from 'react'
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import { useState, useEffect } from 'react';
import EditPage from "./EditPage";
import "./UpcomingInterview.css"
import moment from "moment"

function UpcomingInterview() {

    const [items, setItems] = useState([]);

    async function fetchdata() {
        let res = await fetch("http://127.0.0.1:8000/api/interviews/upcoming", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        })
        setItems(await res.json());
    }

    async function deleteHandler(id) {
        let res = await fetch(`http://127.0.0.1:8000/api/interviews/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            }
        })
    }

    useEffect(() => {
        fetchdata();
    }, []);
    return (
        <>
            <h2 className="head">Upcoming Interviews Details</h2>
            <Container className="mainContainer" >
                {
                    items.interviews?.map((currElem) => {
                        return ( 
                                <Card className="mainCard">
                                    <Card.Body>
                                        <Card.Text>
                                            <p>Start Time: {moment(currElem.startTime).format('MMMM Do YYYY, h:mm a')}</p>
                                            <p>End Time: {moment(currElem.endTime).format('MMMM Do YYYY, h:mm a')}</p>
                                            <p>
                                                Participants:
                                                <ul>
                                                    {
                                                        currElem.usersInvited.map((email) => {
                                                            return (
                                                                <li>
                                                                    {email}
                                                                </li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </p>
                                        </Card.Text>
                                        <Card.Link href={`/edit/${currElem._id}`}><button type="button" class="btn btn-outline-secondary">Edit</button></Card.Link>

                                        <Card.Link href={"/upcoming"}> <button type="button" onClick={() => deleteHandler(currElem._id)} className="btn btn-outline-danger">Delete</button></Card.Link>
                                    </Card.Body>
                                </Card> 
                        )
                    })
                }
            </Container>
        </>
    )
}

export default UpcomingInterview
