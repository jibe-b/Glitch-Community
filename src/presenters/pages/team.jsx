import React from 'react';
import PropTypes from 'prop-types';

import * as assets from '../../utils/assets';
import TeamModel from '../../models/team';
import UserModel from '../../models/user';
import ProjectModel from '../../models/project';
import Reactlet from '../reactlet';
import LayoutPresenter from '../layout';

import {EntityEditorSuite} from '../entity-editor.jsx';
import EntityPageProjects from '../entity-page-projects.jsx';
import AddTeamProject from '../includes/add-team-project.jsx';
import {ProfileContainer, ImageButtons} from '../includes/profile.jsx';
import TeamAnalytics from '../includes/team-analytics.jsx';
import {TeamMarketing, TeamUsers, VerifiedBadge} from '../includes/team-elements.jsx';
import NotFound from '../includes/not-found.jsx';
import {DataLoader} from '../includes/loader.jsx';
import Thanks from '../includes/thanks.jsx';
import AddTeamUser from '../includes/add-team-user.jsx';
import {AuthDescription} from '../includes/description-field.jsx';

const getAvatarStyle = ({id, hasAvatarImage, backgroundColor, cache}) => {
  const customImage = `https://s3.amazonaws.com/production-assetsbucket-8ljvyr1xczmb/team-avatar/${id}/small?${cache}`;
  const defaultImage = "https://cdn.glitch.com/55f8497b-3334-43ca-851e-6c9780082244%2Fdefault-team-avatar.svg?1503510366819";
  return {
    backgroundColor,
    backgroundImage: `url('${hasAvatarImage ? customImage : defaultImage}')`,
  };
};

const getProfileStyle = ({id, hasCoverImage, coverColor, cache}) => {
  const customImage = `https://s3.amazonaws.com/production-assetsbucket-8ljvyr1xczmb/team-cover/${id}/large?${cache}`;
  const defaultImage = "https://cdn.glitch.com/55f8497b-3334-43ca-851e-6c9780082244%2Fdefault-cover-wide.svg?1503518400625";
  return {
    backgroundColor: coverColor,
    backgroundImage: `url('${hasCoverImage ? customImage : defaultImage}')`,
  };
};

const TeamPage = ({
  team: {
    id, name, description, users,
    projects, teamPins,
    isVerified, verifiedImage, verifiedTooltip,
    backgroundColor, hasAvatarImage,
    coverColor, hasCoverImage,
  },
  currentUserIsOnTeam, updateDescription,
  uploadAvatar, uploadCover, clearCover,
  addUser, removeUser,
  addPin, removePin,
  removeProjectFromTeam,
  api, searchUsers, getProjects,
  _cacheAvatar, _cacheCover,
}) => (
  <main className="profile-page team-page">
    <section>
      <ProfileContainer
        avatarStyle={getAvatarStyle({id, hasAvatarImage, backgroundColor, cache: _cacheAvatar})}
        coverStyle={getProfileStyle({id, hasCoverImage, coverColor, cache: _cacheCover})}
        avatarButtons={currentUserIsOnTeam ? <ImageButtons name="Avatar" uploadImage={uploadAvatar}/> : null}
        coverButtons={currentUserIsOnTeam ? <ImageButtons name="Cover" uploadImage={uploadCover} clearImage={hasCoverImage ? clearCover : null}/> : null}
      >
        <h1 className="username">
          {name}
          {isVerified && <VerifiedBadge image={verifiedImage} tooltip={verifiedTooltip}/>}
        </h1>
        <div className="users-information">
          <TeamUsers {...{users, currentUserIsOnTeam, removeUser}}/>
          {currentUserIsOnTeam && <AddTeamUser search={searchUsers} add={addUser} members={users.map(({id}) => id)}/>}
        </div>
        <Thanks count={users.reduce((total, {thanksCount}) => total + thanksCount, 0)}/>
        <AuthDescription authorized={currentUserIsOnTeam} description={description} update={updateDescription} placeholder="Tell us about your team"/>
      </ProfileContainer>
    </section>
    <EntityPageProjects
      projects={projects} pins={teamPins} isAuthorized={currentUserIsOnTeam}
      addPin={addPin} removePin={removePin} projectOptions={{removeProjectFromTeam}}
      getProjects={getProjects}
    />
    {(currentUserIsOnTeam ?
      <TeamAnalytics api={() => api} id={id} currentUserOnTeam={currentUserIsOnTeam} projects={projects}/>
      : <TeamMarketing/>)}
  </main>
);

class TeamPageEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      _cacheAvatar: Date.now(),
      _cacheCover: Date.now(),
    };
  }
  
  async uploadAvatar(blob) {
    try {
      const {id} = this.props.team;
      const {data: policy} = await assets.getTeamAvatarImagePolicy(this.props.api, id);
      await this.props.uploadAssetSizes(blob, policy, assets.AVATAR_SIZES);

      const image = await assets.blobToImage(blob);
      const color = assets.getDominantColor(image);
      await this.props.updateFields({
        hasAvatarImage: true,
        backgroundColor: color,
      });
    } catch (error) {
      console.error(error);
    }
    this.setState({_cacheAvatar: Date.now()});
  }
  
  async uploadCover(blob) {
    try {
      const {id} = this.props.team;
      const {data: policy} = await assets.getTeamCoverImagePolicy(this.props.api, id);
      await this.props.uploadAssetSizes(blob, policy, assets.COVER_SIZES);

      const image = await assets.blobToImage(blob);
      const color = assets.getDominantColor(image);
      await this.props.updateFields({
        hasCoverImage: true,
        coverColor: color,
      });
    } catch (error) {
      console.error(error);
    }
    this.setState({_cacheCover: Date.now()});
  }
  
  render() {
    const {
      team,
      currentUserId,
      updateFields,
      addItem,
      removeItem,
      ...props
    } = this.props;
    const funcs = {
      currentUserIsOnTeam: team.users.some(({id}) => currentUserId === id),
      updateFields: data => updateFields(data),
      updateDescription: description => updateFields({description}),
      addUser: id => addItem('users', id, 'users', UserModel({id}).asProps()),
      removeUser: id => removeItem('users', id, 'users', {id}),
      uploadAvatar: () => assets.requestFile(this.uploadAvatar.bind(this)),
      uploadCover: () => assets.requestFile(this.uploadCover.bind(this)),
      clearCover: () => updateFields({hasCoverImage: false}),
      removeProjectFromTeam: id => removeItem('projects', id, 'projects', {id}),
      addPin: projectId => addItem('pinned-projects', projectId, 'teamPins', {projectId}),
      removePin: projectId => removeItem('pinned-projects', projectId, 'teamPins', {projectId}),
    };
    return <TeamPage team={team} {...this.state} {...funcs} {...props}/>;
  }
}
TeamPageEditor.propTypes = {
  currentUserId: PropTypes.number.isRequired,
  team: PropTypes.object.isRequired,
  updateFields: PropTypes.func.isRequired,
  addItem: PropTypes.func.isRequired,
  removeItem: PropTypes.func.isRequired,
  uploadAssetSizes: PropTypes.func.isRequired,
};

const TeamPageLoader = ({api, get, name, ...props}) => (
  <DataLoader get={get} renderError={() => <NotFound name={name}/>}>
    {team => team ? (
      <EntityEditorSuite api={api} initial={team} type="teams">
        {({entity, ...funcs}) => (
          <TeamPageEditor api={api} team={entity} {...funcs} {...props}/>
        )}
      </EntityEditorSuite>
    ) : <NotFound name={name}/>}
  </DataLoader>
);
TeamPageLoader.propTypes = {
  get: PropTypes.func.isRequired,
  name: PropTypes.node.isRequired,
};

export default function(application, id, name) {
  const props = {
    name,
    api: application.api(),
    currentUserId: application.currentUser().id(),
    get: () => application.api().get(`teams/${id}`).then(({data}) => (data ? TeamModel(data).update(data).asProps() : null)),
    searchUsers: (query) => UserModel.getSearchResultsJSON(application, query).then(users => users.map(user => UserModel(user).asProps())),
    getProjects: (ids) => application.api().get(`projects/byIds?ids=${ids.join(',')}`).then(({data}) => data.map(d => ProjectModel(d).update(d).asProps())),
  };
  const content = Reactlet(TeamPageLoader, props, 'teampage');
  return LayoutPresenter(application, content);
}