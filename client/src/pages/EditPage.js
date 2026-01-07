import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import moment from "moment";
// Select
import Select from "react-select";

import Card from 'react-bootstrap/Card';

function EditInterview() {

    const navigate = useNavigate();
    const { interviewId } = useParams();

    const [interview, setInterview] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [availableparticipants, setavailableParticipants] = useState([]);
    const [title, setTitle] = useState("");
    const [role, setRole] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [roleDescription, setRoleDescription] = useState("");
    const [companyDescription, setCompanyDescription] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [date, setDate] = useState("");
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);
    const [isGeneratingDescriptions, setIsGeneratingDescriptions] = useState(false);

    async function fetchdata() {
        try {
            let res = await fetch(`http://localhost:8000/api/interviews/${interviewId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            let data = await res.json();
            setInterview(data.interview);
            
            // Populate form fields
            if (data.interview) {
                setTitle(data.interview.title || "");
                setRole(data.interview.role || "");
                setCompanyName(data.interview.companyName || "");
                setRoleDescription(data.interview.roleDescription || "");
                setCompanyDescription(data.interview.companyDescription || "");
                
                const start = new Date(data.interview.startTime);
                const end = new Date(data.interview.endTime);
                
                setDate(start.toISOString().split('T')[0]);
                setStartTime(start.toTimeString().slice(0, 5));
                setEndTime(end.toTimeString().slice(0, 5));
                
                // Set participants
                const participantOptions = data.interview.usersInvited.map(user => ({
                    label: user.email,
                    value: user.email
                }));
                setParticipants(participantOptions);
            }
        } catch (err) {
            console.error("Error fetching interview:", err);
            alert("Failed to load interview details");
        }
    }

    useEffect(() => {
        fetchdata();
        fetchAllUsers();
    }, [interviewId]);

    async function fetchAllUsers() {
        try {
            let res = await fetch("http://localhost:8000/api/users/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            let data = await res.json();
            if (data.users) {
                const allUsers = data.users.map(user => ({
                    label: user.email,
                    value: user.email
                }));
                setavailableParticipants(allUsers);
            }
        } catch (err) {
            console.error("Error fetching all users:", err);
        }
    }

    let handleGenerateDescriptions = async (e) => {
        e.preventDefault();
        
        if (!companyName || companyName.trim() === "") {
            alert("Company name is required to generate descriptions");
            return;
        }
        if (!role || role.trim() === "") {
            alert("Role is required to generate descriptions");
            return;
        }

        setIsGeneratingDescriptions(true);
        try {
            let res = await fetch("http://localhost:8000/api/interviews/generate-descriptions", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    companyName: companyName.trim(),
                    role: role.trim(),
                }),
            });
            let resJson = await res.json();
            if(res.status !== 200) {
                alert(resJson.message || "Failed to generate descriptions");
            } else {
                setRoleDescription(resJson.roleDescription || "");
                setCompanyDescription(resJson.companyDescription || "");
            }
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setIsGeneratingDescriptions(false);
        }
    };

    let handleFormUsers = async (e) => {
        e.preventDefault();
        const formattedStartTime = moment(
            `${date} ${startTime}`,
            "YYYY-MM-DD HH:mm:ss"
        ).format();
        const formattedendTime = moment(
            `${date} ${endTime}`,
            "YYYY-MM-DD HH:mm:ss"
        ).format();
        
        try {
            let res = await fetch(`http://localhost:8000/api/interviews/available`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    startTime: formattedStartTime,
                    endTime: formattedendTime,
                }),
            });
            let resJson = await res.json();
            if(resJson.status === 400) {
                alert(resJson.message);
            } else {
                let ava = [];
                resJson.availableUser.map((users) => {
                    ava.push({ label: users, value: users });
                });
                setavailableParticipants(ava);
            }
        } catch (err) {
            console.log(err);
            alert("Error checking available users");
        }
    };


    let handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!title || title.trim() === "") {
            alert("Interview title is required");
            return;
        }
        if (!role || role.trim() === "") {
            alert("Role is required");
            return;
        }
        if (!companyName || companyName.trim() === "") {
            alert("Company name is required");
            return;
        }
        if (!roleDescription || roleDescription.trim() === "") {
            alert("Role description is required");
            return;
        }
        if (!companyDescription || companyDescription.trim() === "") {
            alert("Company description is required");
            return;
        }
        if (participants.length < 2) {
            alert("At least 2 participants are required");
            return;
        }

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

        setIsFormSubmitting(true);
        try {
            let res = await fetch(`http://localhost:8000/api/interviews/${interviewId}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title.trim(),
                    role: role.trim(),
                companyName: companyName.trim(),
                roleDescription: roleDescription.trim(),
                companyDescription: companyDescription.trim(),
                    usersInvited: users,
                    startTime: formattedStartTime,
                    endTime: formattedendTime,
                }),
            });
            let resJson = await res.json();
            if(res.status !== 200) {
                alert(resJson.message || "Failed to update interview");
            } else {
                alert("Interview updated successfully!");
                navigate('/upcoming');
            }
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setIsFormSubmitting(false);
        }
    };
    return (

        <Container fluid>



            <h4 className="head">Edit Interview</h4>
            {interview && (
                <div className="col d-flex justify-content-center mt-10 mb-10">
                    <Card style={{ width: "20rem" }}>
                        <Card.Body>
                            <Card.Text>
                                <p><strong>Title:</strong> {interview.title}</p>
                                <p><strong>Role:</strong> {interview.role}</p>
                                <p><strong>Company:</strong> {interview.companyName}</p>
                                <p><strong>Role Description:</strong> {interview.roleDescription}</p>
                                <p><strong>Company Description:</strong> {interview.companyDescription}</p>
                                <p><strong>Start Time:</strong> {moment(interview.startTime).format('MMMM Do YYYY, h:mm a')}</p>
                                <p><strong>End Time:</strong> {moment(interview.endTime).format('MMMM Do YYYY, h:mm a')}</p>
                                <p>
                                    <strong>Participants:</strong>
                                    <ul>
                                        {
                                            interview.usersInvited.map((user, index) => {
                                                return (
                                                    <li key={index}>
                                                        {user.email}
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
            )}

            <Container width= "10%">
            <form onSubmit={handleFormUsers} className="flex flex-col">
                <div className="mb-3">
                    <label className="form-label">Interview Title : </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="form-control"
                        placeholder="Enter interview title"
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Role : </label>
                    <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                        className="form-control"
                        placeholder="Enter role"
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Company Name : </label>
                    <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        className="form-control"
                        placeholder="Enter company name"
                    />
                </div>

                <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label mb-0">Role Description : </label>
                        <button
                            type="button"
                            onClick={handleGenerateDescriptions}
                            className="btn btn-sm btn-outline-primary"
                            disabled={isGeneratingDescriptions || !companyName.trim() || !role.trim()}
                        >
                            {isGeneratingDescriptions ? "Generating..." : "Generate Description"}
                        </button>
                    </div>
                    <textarea
                        value={roleDescription}
                        onChange={(e) => setRoleDescription(e.target.value)}
                        required
                        className="form-control"
                        placeholder="Describe the role"
                        rows="3"
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Company Description : </label>
                    <textarea
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                        required
                        className="form-control"
                        placeholder="Describe the company"
                        rows="3"
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Date : </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="form-control"
                    />
                </div>
                
                <div className="mb-3">
                <label className="form-label">Start Time : </label>
                <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="form-control"
                />
                </div>

                <div className="mb-3">
                <label className="form-label">End Time : </label>
                <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="form-control"
                />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isFormSubmitting}
                >
                    {isFormSubmitting ? "Checking availability..." : "Check Available Participants"}
                </button>
            </form>






            {/* second form */}

            <form onSubmit={handleFormSubmit} className="flex flex-col">
                <div className="mb-3 mt-2">
                <label>Select Participants (at least 2 required) : </label>
                <Select
                    isMulti
                    closeMenuOnSelect={false}
                    name="participants"
                    options={availableparticipants.length > 0 ? availableparticipants : participants.map(p => ({label: p.label, value: p.value}))}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={(selectedOption) => {
                        setParticipants(selectedOption);
                    }}
                    value={participants}
                />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isFormSubmitting || participants.length < 2}
                >
                    {isFormSubmitting ? "Updating..." : "Update Interview"}
                </button>
            </form>
            </Container>
        </Container>
    );
}

export default EditInterview;