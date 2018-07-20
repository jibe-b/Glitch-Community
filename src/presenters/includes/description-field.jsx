import React from 'react';
import PropTypes from 'prop-types';
import TextArea from 'react-textarea-autosize';
import Markdown from './markdown.jsx';
import {debounce} from 'lodash';
import {AdminOnlyBadge} from './team-elements.jsx' 

class EditableDescription extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false,
      description: this.props.initialDescription,
    };
    
    this.onChange = this.onChange.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.update = debounce(this.props.updateDescription, 1000);
  }
  
  onChange(evt) {
    const description = evt.currentTarget.value;
    this.setState({ description });
    this.update(description.trim());
  }
  
  onFocus(evt) {
    if (evt.currentTarget === evt.target) {
      this.setState({focused: true});
    }
  }
  
  onBlur() {
    this.setState({focused: false});
  }
  
  render() {
    const {placeholder} = this.props;
    const {description} = this.state;
    return (this.state.focused
      ?
      <TextArea
        className="description content-editable"
        value={description}
        onChange={this.onChange}
        onFocus={this.onFocus} onBlur={this.onBlur}
        placeholder={placeholder}
        spellCheck={false}
        autoFocus // eslint-disable-line jsx-a11y/no-autofocus
      />
      :
      <p
        className="description content-editable"
        placeholder={placeholder} aria-label={placeholder}
        role="textbox" // eslint-disable-line jsx-a11y/no-noninteractive-element-to-interactive-role
        tabIndex={0} onFocus={this.onFocus} onBlur={this.onBlur}
      >
        <Markdown>{description}</Markdown>
      </p>
    );
  }
}
EditableDescription.propTypes = {
  initialDescription: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  updateDescription: PropTypes.func.isRequired,
};

const StaticDescription = ({description, currentUserIsTeamAdmin}) => (
  description ? 
    <p className="description read-only">
      <Markdown>{description}</Markdown>
      <AdminOnlyBadge currentUserIsTeamAdmin={currentUserIsTeamAdmin}/>
    </p> 
  : null
);
StaticDescription.propTypes = {
  description: PropTypes.string.isRequired,
  currentUserIsTeamAdmin: PropTypes.bool,
};

const AuthDescription = ({authorized, description, placeholder, update, currentUserIsTeamAdmin}) => (
  authorized ?
    <EditableDescription initialDescription={description} updateDescription={update} placeholder={placeholder}/> :
    <StaticDescription description={description} currentUserIsTeamAdmin={currentUserIsTeamAdmin}/>
);
AuthDescription.propTypes = {
  authorized: PropTypes.bool.isRequired,
  description: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  update: PropTypes.func.isRequired,
  currentUserIsTeamAdmin: PropTypes.bool,
};

export { EditableDescription, StaticDescription, AuthDescription };