import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import moment from "moment";
// Select
import Select from "react-select";

import Card from 'react-bootstrap/Card';

let availableParticipants = []

function EditInterview() {

    const navigate = useNavigate();
    const { interviewId } = useParams();

    const [interview, setInterview] = useState([]);
    async function fetchdata() {
        let res = await fetch(`http://127.0.0.1:8000/api/interviews/${interviewId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        })
        setInterview(await res.json());
    }

    useEffect(() => {
        fetchdata();
    }, []);

    const [participants, setParticipants] = useState([]);
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [date, setDate] = useState(new Date());
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);

    let handleFormUsers = async (e) => {
        e.preventDefault();
        try {
            let res = await fetch(`http://127.0.0.1:8000/api/interviews/available`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    startTime: startTime,
                    endTime: endTime,
                }),
            });
            let resJson = await res.json();
            resJson = resJson.availableUser;
            for (let users of resJson) {
                availableParticipants.push({ label: users, value: users });
            }
        } catch (err) {
            console.log(err);
        }
    };


    let handleFormSubmit = async (e) => {
        e.preventDefault();

        const users = [];
        participants.forEach((participant) => users.push(participant.value));

        const formattedStartTime = moment(
            `${date} ${startTime}`,
            "YYYY-MM-DD HH:mm:ss"
        ).format();
        const formattedendTime = moment(
            `${date} ${endTime}`,
            "YYYY-MM-DD HH:mm:ss"
        ).format();

        const interviewform = new FormData();
        interviewform.append("usersInvited", users);
        interviewform.append("startTime", formattedStartTime);
        interviewform.append("endTime", formattedendTime);

        let res = await fetch(`http://127.0.0.1:8000/api/interviews/${interviewId}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usersInvited: users,
                startTime: formattedStartTime,
                endTime: formattedendTime,
            }),
        });
        let resJson = await res.json();
        navigate('/upcoming');
    };
    return (

        <Container fluid>



            <h1 className="head">Edit Interview</h1>
            <div className="col d-flex justify-content-center mt-10 mb-10">
                <Card style={{ width: "20rem" }}>
                    <Card.Body>
                        <Card.Text>
                            <p>Start Time: {interview.interview?.startTime}</p>
                            <p>End Time: {interview.interview?.endTime}</p>
                            <p>
                                Participents:
                                <ul>
                                    {
                                        interview.interview?.usersInvited.map((email) => {
                                            return (
                                                <li>
                                                    {email.email}
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            </p>
                        </Card.Text>
                    </Card.Body>
                </Card>
            </div>


            <form onSubmit={handleFormUsers} className="flex flex-col">
                <div class="mb-3">
                    <label class="form-label">Date : </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        class="form-control"
                    />
                </div>
                
                <div class="mb-3">
                <label class="form-label">Start Time : </label>
                <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    class="form-control"
                />
                </div>

                <div class="mb-3">
                <label class="form-label">End Time : </label>
                <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    class="form-control"
                />
                </div>

                <button
                    type="submit"
                    class="btn btn-primary"
                    disabled={isFormSubmitting}
                >
                    {isFormSubmitting ? "Submitting..." : "Submit"}
                </button>
            </form>






            {/* second form */}

            <form onSubmit={handleFormSubmit} className="flex flex-col">
                <div class="mb-3 mt-5">
                <label>Select Participants : </label>
                <Select required
                    isMulti
                    closeMenuOnSelect={false}
                    // components={animatedComponents}
                    name="participants"
                    options={availableParticipants}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={(selectedOption) => {
                        setParticipants(selectedOption);
                    }}
                />
                </div>

                <button
                    type="submit"
                    class="btn btn-primary"
                    disabled={isFormSubmitting}
                >
                    {isFormSubmitting ? "Submitting..." : "Submit"}
                </button>
            </form>
        </Container>
    );
}

export default EditInterview;