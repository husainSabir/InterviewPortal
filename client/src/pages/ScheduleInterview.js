import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import moment from "moment";
import axios from "axios";
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
  //hooks
  const [availableparticipants, setavailableParticipants] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [date, setDate] = useState(new Date());
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);


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
      let res = await fetch("http://127.0.0.1:8000/api/interviews/available", {
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
      if(resJson.status == 400) {
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

    const interview = new FormData();
    interview.append("usersInvited", users);
    interview.append("startTime", formattedStartTime);
    interview.append("endTime", formattedendTime);

    let res = await fetch("http://127.0.0.1:8000/api/interviews/", {
      method: "POST",
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
    if(resJson.status != 201) {
      alert(resJson.message);
    }
  };

  return (
    <Container fluid className="UpcomingSchedule">
      <h1 className="head">Schedule a new Interview</h1>

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
        <Select
          isMulti
          closeMenuOnSelect={false}
          // components={animatedComponents}
          name="participants"
          options={availableparticipants}
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

  )
}

export default ScheduleInterview;

