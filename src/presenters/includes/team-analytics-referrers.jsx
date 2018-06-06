import React from 'react';
import PropTypes from 'prop-types';

const countTotals = (data, countProperty) => {
  let total = 0;
  data.forEach(referrer => {
    total += referrer[countProperty];
  });
  return total;
};

const ReferrerItem = ({referrer, countProperty, data}) => {
  const total = countTotals(data, countProperty);
  const count = referrer[countProperty];
  const progress = Math.max(Math.round(count / total * 100), 5);
  return (
    <li>
      {referrer.domain}, {count.toLocaleString('en')}
      <progress value={progress} max="100" />
    </li>
  );
};

const filterReferrers = (referrers) => {
  let filteredReferrers = referrers.filter(referrer =>
    !referrer.self
  );
  filteredReferrers = filteredReferrers.slice(0,5);
  return filteredReferrers;
};

const TeamAnalyticsReferrers = ({analytics}) => {
  const appViewReferrers = filterReferrers(analytics.referrers);
  const remixReferrers = filterReferrers(analytics.remixReferrers);
  return (
    <div className="referrers-columns">
      <article className="referrers-column">
        <h4>
          <div className="legend-item"/>
          App Views
        </h4>
        <ul>
          { appViewReferrers.map((referrer, key) => (
            <ReferrerItem
              key={key}
              referrer = {referrer}
              countProperty = "requests"
              data = {appViewReferrers}
            />
          ))}
        </ul>
      </article>
      
      <article className="referrers-column">
        <h4>
          <div className="legend-item"/>
          Remixes
        </h4>
        <ul>
          { remixReferrers.map((referrer, key) => (
            <ReferrerItem
              key={key}
              referrer = {referrer}
              countProperty = "remixes"
              data = {remixReferrers}
            />
          ))}
        </ul>
      </article> 
    </div>
  );
};

TeamAnalyticsReferrers.propTypes = {
  analytics: PropTypes.object.isRequired,
};

export default TeamAnalyticsReferrers;
