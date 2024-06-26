import React from 'react';
import PropTypes from 'prop-types';
import styles from './TagViewer.css';

function tagViewer(props) {
  const classNames = [styles.container];
  if (props.className) {
    classNames.push(props.className);
  }
  const tagComponents =
    props.tags && props.tags.length > 0
      ? props.tags.map((t) => (
          <div key={t} className={styles.tag}>
            {t}
          </div>
        ))
      : null;
  return <div className={classNames.join(' ')}>{tagComponents}</div>;
}

tagViewer.propTypes = {
  tags: PropTypes.array.isRequired,
};

export default tagViewer;
