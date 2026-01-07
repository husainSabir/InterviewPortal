import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import moment from "moment";
import { useNavigate } from "react-router-dom";
// Form
import Form from 'react-bootstrap/Form';
import "./ScheduleInterview.css";
// button
import Button from 'react-bootstrap/Button';
// react-select
import Select from 'react-select';

// let availableParticipants = [];

function ScheduleInterview() {
  const navigate = useNavigate();
  //hooks
  const [availableparticipants, setavailableParticipants] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [date, setDate] = useState(new Date());
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isGeneratingDescriptions, setIsGeneratingDescriptions] = useState(false);

  useEffect(() => {
    fetchAllUsers();
  }, []);

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
      let res = await fetch("http://localhost:8000/api/interviews/available", {
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
      console.log(resJson);
      if(resJson.status === 400) {
        alert(resJson.message)
      }
      else{
        let ava = []
        resJson = resJson["availableUser"];
        resJson.map((users) => {
          ava.push({ label: users, value: users });
        });
        setavailableParticipants(ava);
      }
    } catch (err) {
      console.log(err);
      alert("Error checking available users");
    }
  };


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
      let res = await fetch("http://localhost:8000/api/interviews/", {
        method: "POST",
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
      if(res.status !== 201) {
        alert(resJson.message || "Failed to create interview");
      } else {
        alert("Interview scheduled successfully!");
        // Reset form
        setTitle("");
        setRole("");
        setCompanyName("");
        setRoleDescription("");
        setCompanyDescription("");
        setParticipants([]);
        setavailableParticipants([]);
        navigate("/upcoming");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  return (
    <Container fluid className="UpcomingSchedule">
      <Container width= "10%">
      <h3 className="head">Schedule a new Interview</h3>

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
          className="btn btn-primary "
          disabled={isFormSubmitting}
        >
          {isFormSubmitting ? "Checking availability..." : "Check Available Participants"}
        </button>
      </form>






      {/* second form */}

      <form onSubmit={handleFormSubmit} className="flex flex-col">
        <div className="mb-3 mt-5">
        <label>Select Participants (at least 2 required) : </label>
        <Select
          isMulti
          closeMenuOnSelect={false}
          name="participants"
          options={availableparticipants}
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
          {isFormSubmitting ? "Scheduling..." : "Schedule Interview"}
        </button>
      </form>
      </Container>
    </Container>

  )
}

export default ScheduleInterview;

