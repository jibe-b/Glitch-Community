import React from 'react';
import PropTypes from 'prop-types';
import {sampleSize} from 'lodash';

import FeaturedItems from '../curated/featured';
import FeaturedEmbedObject from '../curated/featured-embed';

import Link from './includes/link.jsx';

import FeaturedEmbed from './featured-embed.jsx';

class ZineItems extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: window.ZINE_POSTS.slice(0, 4), 
      masks: sampleSize([1, 2, 3, 4, 5], 4),
    };
  }
  render() {
    if (!this.state.posts.length) {
      return null;
    }
    return (
      <section>
        <ul className="zine-items">
          {this.state.posts.map(({id, title, url, feature_image, primary_tag}, n) => (
            <li key={id} className="zine-item">
              <Link to={`/culture${url}`}>
                {!!feature_image && <div className="mask-container">
                  <img className={`mask mask-${this.state.masks[n]}`} src={feature_image} alt=""/>
                </div>}
                <div className="zine-item-meta">
                  <h1 className="zine-item-title">{title}</h1>
                  {!!primary_tag && <p className="zine-item-tag">
                    {primary_tag.name}
                  </p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }
}

const FeaturedPanel = ({img, link, title}) => (
  <Link to={link} data-track="featured-project" data-track-label={title}>
    <div className="featured-container">
      <img className="featured" src={img} alt=""/>
      <p className="project-name">{title}</p>
    </div>
  </Link>
);
FeaturedPanel.propTypes = {
  img: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

const Featured = ({featured}) => (
  <section className="featured featured-collections">
    <div className="community-pick-embed-container">
      <FeaturedEmbed feature={FeaturedEmbedObject}/>
    </div>
    
    <section>
      <ul className="featured-items">
        {featured.map(item => (
          <li key={item.link}>
            <FeaturedPanel {...item}/>
          </li>
        ))}
      </ul>
    </section>
    
    <ZineItems/>
  </section>
);
Featured.propTypes = {
  embedHtml: PropTypes.string.isRequired,
  featured: PropTypes.array.isRequired,
};


const FeaturedContainer = ({isAuthorized}) => (
  <Featured featured={FeaturedItems} isAuthorized={isAuthorized}/>
);

FeaturedContainer.propTypes = {
  isAuthorized: PropTypes.bool,
};

export default FeaturedContainer;