import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-mini';
import _ from 'lodash';

import Loader from './loader.jsx';
import TeamAnalyticsTimePop from '../pop-overs/team-analytics-time-pop.jsx';
import TeamAnalyticsProjectPop from '../pop-overs/team-analytics-project-pop.jsx';
import TeamAnalyticsActivity from '../pop-overs/team-analytics-activity.jsx';

const dateFromTime = (newTime) => {
  const timeMap = [
    {
      time: "Last 4 Weeks",
      date: moment().subtract(4, 'weeks').valueOf(),
    },
    {
      time: "Last 2 Weeks",
      date: moment().subtract(2, 'weeks').valueOf(),
    },
    {
      time: "Last 24 Hours",
      date: moment().subtract(24, 'hours').valueOf(),
    },
  ]
  let time = _.find(timeMap, {time: newTime})
  return time.date
;}

// getAnalyticsProjectOverview = () (based on current project, not for all)

const getAnalytics = async ({id, api}, requestDate) => {
  console.log (requestDate)
  let path = `analytics/${id}/team?from=${requestDate}`;
  try {
    return await api().get(path);
  } catch (error) {
    console.error('getAnalytics', error);
  }
}

// layout:
  // Controls
  // Activity (TeamAnalyticsActivity)
  // Project Overview/Details (projects remixed, etc. from weak-particle)
  // Referrers

class TeamAnalytics extends React.Component {
  constructor(props) {
    super(props);
      this.state = {
      currentTimeFrame: 'Last 2 Weeks',
      requestDate: moment().subtract(2, 'weeks').valueOf(),
      currentProjectDomain: 'All Projects',
      analytics: {},
      c3: {},
      isGettingData: true,
      isGettingC3: true,
      totalRemixes: 0,
      totalAppViews: 0,
    };
  }

  updateTimeFrame(newTime) {
    // let dateFrom = 0
    // if (newTime === "Last 4 Weeks") {
    //   dateFrom = moment().subtract(4, 'weeks').valueOf()
    // } else if (newTime === "Last 2 Weeks") {
    //   dateFrom = moment().subtract(4, 'weeks').valueOf() 
    // }
    
    this.setState({
      currentTimeFrame: newTime,
      requestDate: dateFromTime(newTime)
    });
  }

  updateProjectdomain(newDomain) {
    this.setState({
      currentProjectDomain: newDomain
    });
  }

//   updateTotalRemixes(newValue) {
//     console.log(yolo, newValue)
//     this.setState({
//       totalRemixes: newValue
//     });
//   }

//   updateTotalAppViews(newValue) {
//     this.setState({
//       totalAppViews: newValue
//     });
//   }

  dateFrom() {
    let time = this.state.currentTimeFrame
    if (time === "Last 4 Weeks") {
      return moment().subtract(4, 'weeks').valueOf()
    } else if (time === "Last 2 Weeks") {
      return moment().subtract(2, 'weeks').valueOf()
    } else if (time === "Last 24 Hours") {
      return moment().subtract(24, 'hours').valueOf()
    }
  };


  updateAnalytics() {
    this.setState({
      isGettingData: true,
    });
    getAnalytics(this.props, this.state.requestDate).then(({data}) => {
      this.setState({
        isGettingData: false,
        analytics: data,
      });
      // console.log('🌎', this.state, this.state.analytics);
    });
  }
  


  
  componentDidMount() {
    import("c3").then(c3 => { // eslint-disable-line
      this.setState({
        c3: c3,
        isGettingC3: false,
      })
      this.updateAnalytics();
    });
  }
  
  render() {
    return (
      <section>
        <h2>Analytics</h2>
        <p>{this.state.currentTimeFrame}</p>
        <p>{this.state.currentProjectDomain}</p>
        <p>{this.state.totalAppViews}</p>
        <p>{this.state.totalRemixes}</p>        
        
        <section className="controls">
          <TeamAnalyticsTimePop 
            updateTimeFrame = {this.updateTimeFrame.bind(this)}
            currentTimeFrame = {this.state.currentTimeFrame}
          />
          <TeamAnalyticsProjectPop
            updateProjectdomain = {this.updateProjectdomain.bind(this)}
            currentProjectDomain = {this.state.currentProjectDomain}
            projects = {this.props.projects}
          />
        </section>
        
        <section className="summary">
          { (this.state.isGettingData) &&
            <Loader />
          ||
            <p>
              <span className="total remixes">123</span>
              Remixes,&nbsp;
              <span className="total app-views">456</span>
              App views
            </p>
          }
        </section>
        
        <section className="activity">
          <figure id="chart" className="c3"/>
          { (this.state.isGettingData || this.state.isGettingC3) && 
            <Loader /> 
          }
          { (!this.state.isGettingC3) &&
            <TeamAnalyticsActivity 
              c3 = {this.state.c3}
              analytics = {this.state.analytics}
              isGettingData = {this.state.isGettingData}
            />
          }
        </section>
        
        <section className="Referrers">analytics.referrers</section>
      </section>
    );
  }
}

TeamAnalytics.propTypes = {
  id: PropTypes.number.isRequired,
  api: PropTypes.func.isRequired,
  projects: PropTypes.array.isRequired,
};

export default TeamAnalytics;
