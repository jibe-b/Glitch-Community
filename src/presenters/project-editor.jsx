import React from 'react';
import PropTypes from 'prop-types';

import {CurrentUserConsumer} from './current-user.jsx';
import ErrorHandlers from './error-handlers.jsx';

class ProjectEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props.initialProject
    };
  }
  
  userIsMember() {
    if (!this.props.currentUser) return false;
    const currentUserId = this.props.currentUser.id;
    return this.state.users.some(({id}) => currentUserId === id);
  }
  
  async updateFields(changes) {
    await this.props.api.patch(`projects/${this.state.id}`, changes);
    this.setState(changes);
  }
  
  render() {
    const {handleError, handleErrorForInput} = this.props;
    const funcs = {
      updateDomain: domain => this.updateFields({domain}).catch(handleErrorForInput),
      updateDescription: description => this.updateFields({description}).catch(handleError),
      updatePrivate: isPrivate => this.updateFields({private: isPrivate}).catch(handleError),
    };
    return this.props.children(this.state, funcs, this.userIsMember());
  }
}
ProjectEditor.propTypes = {
  api: PropTypes.any.isRequired,
  children: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  handleError: PropTypes.func.isRequired,
  handleErrorForInput: PropTypes.func.isRequired,
  initialProject: PropTypes.object.isRequired,
};

const ProjectEditorContainer = ({api, children, initialProject}) => (
  <ErrorHandlers>
    {wrapErrors => (
      <CurrentUserConsumer>
      </CurrentUserConsumer>
      <ProjectEditor api={api} currentUser={currentUser} initialProject={initialProject} {...wrapErrors}>
        {children}
      </ProjectEditor>
    )}
  </ErrorHandlers>
);
ProjectEditorContainer.propTypes = {
  api: PropTypes.any.isRequired,
  children: PropTypes.func.isRequired,
  initialProject: PropTypes.object.isRequired,
};

export default ProjectEditorContainer;