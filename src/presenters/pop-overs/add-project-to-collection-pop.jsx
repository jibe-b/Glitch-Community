import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom';
import {debounce} from 'lodash';

import {getLink,colors, defaultAvatar} from '../../models/collection';
import {getAvatarUrl} from '../../models/project';

import Loader from '../includes/loader.jsx';

import CollectionResultItem from '../includes/collection-result-item.jsx';
import UserResultItem from '../includes/user-result-item.jsx';

import Notifications from '../notifications.jsx';

import {NestedPopoverTitle} from './popover-nested.jsx';
import {PureEditableField} from '../includes/editable-field.jsx';

import _ from 'lodash';

class AddProjectToCollectionPop extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      working: false,
      error: null, //null or string
      query: '', //The actual search text
      maybeCollections: null, //null means still loading
    };
    
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  async componentDidMount() {
    const collections = await this.props.api.get(`collections/?userId=${this.props.currentUser.id}`);
    this.setState({maybeCollections: _.orderBy(collections.data, collection => collection.updatedAt).reverse()});
  }
  
  handleChange(newValue) {
    this.setState({ query: newValue, error: null });
  }

  async handleSubmit(event){
    event.preventDefault();
    console.log('add project to new collection');
    this.setState({working: true});
    // get text from input field
    const newCollectionName = this.state.query;
    
    // create a new collection
    try{
      let name = newCollectionName;
      let description = `A collection of projects that does wondrous things`; // change default later
      let url = _.kebabCase(newCollectionName);
      let avatarUrl = defaultAvatar;
      let coverColor = _.sample(Object.values(colors));
      
      const {data} = await this.props.api.post('collections', {
        name,
        description,
        url,
        avatarUrl,
        coverColor,
      });

      let newCollection = data;

      // add the selected project to the collection
      await this.props.api.patch(`collections/${newCollection.id}/add/${this.props.project.id}`);         
      
      // redirect to that collection
      const newCollectionUrl = getLink(this.props.currentUser.login, newCollection.url);
      this.setState({newCollectionUrl});
    }catch(error){
      if (error && error.response && error.response.data && error.response.data.message) {
        this.setState({error: error.response.data.message});
      } else {
        window.Raven.captureException(error);
      }
    }
  }
    
  render() {
    const placeholder = 'New Collection Name';
    const {error, maybeCollections, query} = this.state;
    let queryError = this.state.error;
    if (!!maybeCollections && !!query && maybeCollections.some(c => c.url === _.kebabCase(query))) {
      queryError = 'You already have a collection with this url';
    }
    if(this.state.newCollectionUrl){
      return <Redirect to={this.state.newCollectionUrl}/>;
    }
    return (
      <dialog className="pop-over add-project-to-collection-pop wide-pop">
        {( !this.props.fromProject ?
          <NestedPopoverTitle>
            <img src={getAvatarUrl(this.props.project.id)}/> Add {this.props.project.domain} to collection
          </NestedPopoverTitle>
          : null
        )}
        
        {maybeCollections ? (
          maybeCollections.length ? (
            <section className="pop-over-actions results-list">
                <ul className="results">
                  {maybeCollections.map(collection =>   
                  // filter out collections that already contain the selected project
                    (collection.projects.every(project => project.id !== this.props.project.id) && 
                    <li key={collection.id}>
                      <CollectionResultItem 
                        addProjectToCollection={this.props.addProjectToCollection}
                        api={this.props.api}
                        project={this.props.project}
                        collection={collection}                         
                        togglePopover={this.props.togglePopover} 
                      />
                    </li>
                    )
                   )
                 }
                </ul>
            </section>
          ) : (<section className="pop-over-info">
            <p className="info-description">
              Organize your favorite projects in one place
            </p>
          </section>)
        ) : <Loader/>}
        
        <section className="pop-over-info">
          <form onSubmit={this.handleSubmit}>
            <PureEditableField
              id="collection-name"
              className="pop-over-input create-input"
              value={query} 
              update={this.handleChange}
              placeholder={placeholder}
              error={error || queryError}
            />
            {!this.state.working ? (
              <button type="submit" className="create-collection button-small" disabled={!!queryError}>
                Create
              </button>
            ) : <Loader/>}
            <p className="url-preview">
              {/* Handle anonymous users here? */}
              {getLink(this.props.currentUser.login, _.kebabCase(query || placeholder))}
            </p>         
          </form>         
        </section>
      </dialog>
    );
  }
}

AddProjectToCollectionPop.propTypes = {
  addProjectToCollection: PropTypes.func,
  api: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  togglePopover: PropTypes.func.isRequired,
  project: PropTypes.object.isRequired,
  fromProject: PropTypes.bool,
};

export default AddProjectToCollectionPop;
