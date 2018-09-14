import React from 'react';
import PropTypes from 'prop-types';

import _ from 'lodash';
import DevToggles from '../includes/dev-toggles.jsx';
import Loader from '../includes/loader.jsx';
import {PureEditableField} from '../includes/editable-field.jsx';
import {getAvatarUrl as getTeamAvatarUrl} from '../../models/team';
import {getAvatarThumbnailUrl as getUserAvatarUrl} from '../../models/user';
import {Link, TeamLink, UserLink} from '../includes/link.jsx';
import PopoverContainer from './popover-container.jsx';

const TEAM_ALREADY_EXISTS_ERROR = "Team already exists, try another";


// Create Team 🌿

class CreateTeam extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      teamName: '',
      teamUrl: '',
      isLoading: false,
      error: ''
    };
    this.randomDescription = this.randomDescription.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  descriptiveAdjectives() { 
    return [
      'charming',
      'bold',
      'brave',
      'cool',
      'docile',
      'dope',
      'faithful',
      'fertile',
      'fervent',
      'forgiving',
      'genial',
      'genteel',
      'grouchy',
      'hopeful',
      'humane',
      'jolly',
      'joyful',
      'lunar',
      'magical',
      'moral',
      'mysterious',
      'mystery',
      'notorious',
      'passionate',
      'quaint',
      'quirky',
      'scrumptious',
      'sensitive',
      'tropical',
      'woeful',
      'whimsical',
      'zealous',
    ];
  }

  teamSynonyms() {
    return [
      'team',
      'group',
      'coven',
      'squad',
      'crew',
      'party',
      'troupe',
      'band',
      'posse',
    ];
  }
  
  componentDidMount() {
    let initialTeamName = this.randomName();
    this.setState({
      teamName: initialTeamName,
      teamUrl: _.kebabCase(initialTeamName),
    });
  }
  
  randomDescription() {
    let adjectives = _.sampleSize(this.descriptiveAdjectives(), 2);
    return `A ${adjectives[0]} team that makes ${adjectives[1]} things`;
  }
  
  randomName() {
    let adjective = _.sample(this.descriptiveAdjectives());
    return `${_.capitalize(adjective)} ${_.sample(this.teamSynonyms())}`;
  }
  
  isTeamUrlAvailable(url) {
    this.props.api.get(`teams/byUrl/${url}`)
      .then (({data}) => {
        if (data) {
          this.setState({
            error: TEAM_ALREADY_EXISTS_ERROR
          });
        } else {
          this.setState({
            error: ""
          });
        }
      });
  }
  
  handleChange(newValue) {
    let url = _.kebabCase(newValue);
    this.setState({
      teamName: newValue, 
      teamUrl: url,
      error: "",
    });
    this.isTeamUrlAvailable(url);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ isLoading: true });
    this.props.api.post(('teams'), {
      name: this.state.teamName,
      url: this.state.teamUrl,
      hasAvatarImage: false,
      coverColor: '',
      location: '',
      description: this.randomDescription(),
      backgroundColor: '',
      hasCoverImage: false,
      isVerified: false,
    })
      .then (response => {
        this.setState({ isLoading: false });
        window.location = `/@${response.data.url}`;
      }).catch (() => {
        this.setState({
          isLoading: false,
          error: TEAM_ALREADY_EXISTS_ERROR,
        });
      });
  }
  
  render() {
    return (
      <dialog className="pop-over create-team-pop">
        <section className="pop-over-info">
          <div className="pop-title">
            <span>Create Team </span>
            <span className="emoji herb" />
          </div>
        </section>

        <section className="pop-over-info">
          <p className="info-description">
            Showcase your projects in one place, manage collaborators, and view analytics
          </p>
        </section>
        
        <section className="pop-over-actions">  
          <form onSubmit={this.handleSubmit}>
            <PureEditableField
              value={this.state.teamName}
              update={this.handleChange}
              placeholder='Your Team Name'
              error={this.state.error}
            />
            <p className="action-description team-url-preview">
              /@{this.state.teamUrl}
            </p>
          
            {this.state.isLoading && 
            <Loader />
          ||
            <button type="submit" className="button-small has-emoji">
              <span>Create Team </span>
              <span className="emoji thumbs_up" />
            </button>
            }
          </form>

        </section>
        <section className="pop-over-info">
          <p className="info-description">
            You can change this later
          </p>
        </section>
      </dialog>
    );
  }
}

CreateTeam.propTypes = {
  api: PropTypes.func.isRequired,
};


// Create Team button

const CreateTeamButton = ({toggleUserOptionsVisible, userIsAnon}) => {
  if (userIsAnon) {
    return (
      <React.Fragment>
        <p className="description action-description">
          Sign in to create a team
        </p>
        <button className="button button-small has-emoji button-tertiary" disabled>
          Create Team <span className="emoji herb" />
        </button>
      </React.Fragment>
    );
  }
  return (
    <button onClick={toggleUserOptionsVisible} className="button button-small has-emoji button-tertiary">
      Create Team <span className="emoji herb" />
    </button>
  );
};

CreateTeamButton.propTypes = {
  toggleUserOptionsVisible: PropTypes.func.isRequired,
  userIsAnon: PropTypes.bool.isRequired,
};


// Team List

const TeamList = ({teams, toggleUserOptionsVisible, userIsAnon}) => {
  return (
    <DevToggles>
      {toggles => (!!teams.length || toggles.includes('add-teams')) && (
        <section className="pop-over-actions">
          {toggles.includes('add-teams') && (
            <CreateTeamButton toggleUserOptionsVisible={toggleUserOptionsVisible} userIsAnon={userIsAnon} />
          )}
          {teams.map(team => (
            <TeamLink key={team.id} team={team} className="button button-small has-emoji button-tertiary">
              {team.name}&nbsp;
              <img className="emoji avatar" src={getTeamAvatarUrl({...team, size:'small'})} alt="" width="16px" height="16px"/>
            </TeamLink>
          ))}
        </section>
      )}
    </DevToggles>
  );
};

TeamList.propTypes = {
  teams: PropTypes.arrayOf(PropTypes.shape({
    hasAvatarImage: PropTypes.bool.isRequired,
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  })),
  toggleUserOptionsVisible: PropTypes.func.isRequired,
  userIsAnon: PropTypes.bool.isRequired,
};


// User Options 🧕

const UserOptionsPop = ({
  togglePopover,
  toggleUserOptionsVisible,
  user,
  signOut,
  showNewStuffOverlay,
}) => {
  const clickNewStuff = (event) => {
    togglePopover();
    showNewStuffOverlay();
    event.stopPropagation();
  };
  
  const clickSignout = () => {
    if(!user.login) {
      if(!window.confirm(`You won't be able to sign back in under this same anonymous account.
Are you sure you want to sign out?`)) {
        return;
      }
    }
    /* global analytics */
    analytics.track("Logout");
    analytics.reset();
    signOut();
  };
  
  const userName = user.name || "Anonymous";
  const userAvatarStyle = {backgroundColor: user.color};

  return (
    <dialog className="pop-over user-options-pop">
      <UserLink user={user} className="user-info">
        <section className="pop-over-actions user-info">
          <img className="avatar" src={getUserAvatarUrl(user)} alt="Your avatar" style={userAvatarStyle}/>
          <div className="info-container">
            <p className="name" title={userName}>{userName}</p>
            { user.login &&
              <p className="user-login" title={user.login}>@{user.login}</p>
            }
          </div>
        </section>
      </UserLink>
      <TeamList 
        teams={user.teams} 
        toggleUserOptionsVisible={toggleUserOptionsVisible} 
        userIsAnon={!user.login} 
      />
      <section className="pop-over-info section-has-tertiary-buttons">
        <button onClick={clickNewStuff} className="button-small has-emoji button-tertiary button-on-secondary-background">
          New Stuff <span className="emoji dog-face"></span>
        </button>
        <Link to="https://support.glitch.com" className="button button-small has-emoji button-tertiary button-on-secondary-background">
          Support <span className="emoji ambulance"></span>
        </Link>        
        <button onClick={clickSignout} className="button-small has-emoji button-tertiary button-on-secondary-background">
          Sign Out <span className="emoji balloon"></span>
        </button>
      </section>
    </dialog>
  );
};

UserOptionsPop.propTypes = {
  togglePopover: PropTypes.func.isRequired,
  toggleUserOptionsVisible: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  signOut: PropTypes.func.isRequired,
  showNewStuffOverlay: PropTypes.func.isRequired,
};


// User Options or Create Team
// uses userOptionsVisible state to show either UserOptions or CreateTeam content

class UserOptionsAndCreateTeamPop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userOptionsVisible: true
    };
    this.toggleUserOptionsVisible = this.toggleUserOptionsVisible.bind(this);
  }
  
  toggleUserOptionsVisible() {
    this.setState(prevState => ({
      userOptionsVisible: !prevState.userOptionsVisible
    }));
  }
    
  render() {
    return (
      <React.Fragment>
        { this.state.userOptionsVisible ? (
          <UserOptionsPop
            {...this.props}
            toggleUserOptionsVisible={() => this.toggleUserOptionsVisible()}
          />
        ) : (
          <CreateTeam
            {...this.props}
            toggleUserOptionsVisible={() => this.toggleUserOptionsVisible()}
          />
        )}
      </React.Fragment>
    );
  }
}


// Header button and init pop

export default function UserOptionsAndCreateTeamPopContainer(props) {
  const avatarUrl = getUserAvatarUrl(props.user);
  const avatarStyle = {backgroundColor: props.user.color};
  return (
    <PopoverContainer>
      {({togglePopover: togglePopover, visible: popVisible}) => (
        <div className="button user-options-pop-button" data-tooltip="User options" data-tooltip-right="true">
          <button className="user" onClick={() => {togglePopover(); }}>
            <img src={avatarUrl} style={avatarStyle} width="30px" height="30px" alt="User options"/>
            <span className="down-arrow icon"/>
          </button>
          {popVisible && <UserOptionsAndCreateTeamPop
            {...props}
            togglePopover={togglePopover}
          />
          }
        </div>
      )}
    </PopoverContainer>
  );
}

UserOptionsAndCreateTeamPopContainer.propTypes = {
  user: PropTypes.shape({
    avatarThumbnailUrl: PropTypes.string,
    color: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    login: PropTypes.string,
    teams: PropTypes.array.isRequired,
  }).isRequired,
  api: PropTypes.func.isRequired,
};
