import React, { Component } from "react";
import axios from "axios";

import classnames from "classnames";
import {
  getTotalInterviews,
  getLeastPopularTimeSlot,
  getMostPopularDay,
  getInterviewsPerDay,
} from "../helpers/selectors";
import {setInterview} from "../helpers/reducers";

import Loading from './Loading';
import Panel from './Panel';

const data = [
  {
    id: 1,
    label: "Total Interviews",
    getValue: getTotalInterviews
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    getValue: getLeastPopularTimeSlot
  },
  {
    id: 3,
    label: "Most Popular Day",
    getValue: getMostPopularDay
  },
  {
    id: 4,
    label: "Interviews Per Day",
    getValue: getInterviewsPerDay
  }
];

class Dashboard extends Component {
  state = {
    loading: true,
    focused: null,
    days: [],
    apoointments: {},
    interviewers: {}
  }

  componentDidMount() {

    const focused = JSON.parse(localStorage.getItem("focused"));
    if (focused) {
      this.setState({focused})
    };
    const getDaysUrl = `https://scheduleinterview.herokuapp.com/api/days`;
    const getInterviewersUrl = `https://scheduleinterview.herokuapp.com/api/interviewers`;
    const getAppointmentsUrl = `https://scheduleinterview.herokuapp.com/api/appointments`;
    

    const getDays = axios.get(getDaysUrl), getInterviewers = axios.get(getInterviewersUrl), getAppointments = axios.get(getAppointmentsUrl);
    Promise.all([
      getDays, getInterviewers, getAppointments
    ])
    .then(([days, interviewers, appointments]) => {
      this.setState({
        loading: false, days: days.data, interviewers: interviewers.data, appointments: appointments.data
      });
    });
    // ------------------ WEB SOCKET SECTION ------------------------------------------- //
    this.socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
    this.socket.onmessage = event => {
      const data = JSON.parse(event.data);
    
      if (typeof data === "object" && data.type === "SET_INTERVIEW") {
        this.setState(previousState =>
          setInterview(previousState, data.id, data.interview)
        );
      }
    };
  }
  // ----------------------------------------------------------------------------------- //
  componentDidUpdate(prevProps, prevState) {
    if (prevState.focused !== this.state.focused) {
      localStorage.setItem("focused", JSON.stringify(this.state.focused));
    }
  }
  
  selectPanel(id) {
    this.setState(prevState => ({
      focused: prevState.focused !== null ? null : id
    }))
  }

  componentWillUnmount() {
    this.socket.close();
  }

  render() {console.log(process.env.REACT_APP_WEBSOCKET_URL)
    const panelComponent = data
    .filter(panel => this.state.focused === null || this.state.focused === panel.id)
    .map(({id, label, getValue}) => {
      return(
        <Panel 
          key={id} id={id} label={label} value={getValue(this.state)} onSelect={event => this.selectPanel(id)}
        />
      )
    });

    const dashboardClasses = classnames("dashboard", {"dashboard--focused": this.state.focused});
    if (this.state.loading) {
      return (<Loading />);
    } 

    return <main className={dashboardClasses}>{panelComponent}</main>;
  }
}

export default Dashboard;