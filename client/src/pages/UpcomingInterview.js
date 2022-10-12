import React from 'react'
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import { useState, useEffect } from 'react';
import EditPage from "./EditPage";



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

    async function deleteHandler(id){
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
        <Container >
            <h2 className="head">Upcoming Interviews Details</h2>
            {
                items.interviews?.map((currElem) => {
                    return (
                        <div className="col d-flex justify-content-center">
                            <Card className="mt-2 mb-2" style={{ width: '20rem' }}>
                                <Card.Body>

                                    <Card.Text>
                                        <p>Start Time: {currElem.startTime}</p>
                                        <p>End Time: {currElem.endTime}</p>
                                        <p>
                                            Participents:
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
                                    <Card.Link href={`/edit/${currElem._id}`}><button type="button" className="btn btn-info">Edit</button></Card.Link>

                                    <Card.Link href ={"/upcoming"}> <button type="button" onClick = {()=> deleteHandler(currElem._id)} className="btn btn-info">Delete</button></Card.Link>
                                </Card.Body>
                            </Card>
                            
                        </div>
                    )
                })
            }
        </Container>
    )
}

export default UpcomingInterview
