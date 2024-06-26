import React, { Component } from 'react';
import { Button } from '@mui/material';
import { dialog } from '@electron/remote';
import PropTypes from 'prop-types';
import Error from '../Error/Error';
import ConfigFileInfo from '../ConfigFileInfo/ConfigFileInfo';
import styles from './NewDirectory.css';

class NewDirectory extends Component {
  constructor(props) {
    super(props);
    this.handleBrowseDirectory = this.handleBrowseDirectory.bind(this);
    this.handleNameChanged = this.handleNameChanged.bind(this);
    this.state = {
      validationErrorMessage: null,
    };
  }

  handleBrowseDirectory = () => {
    dialog
      .showOpenDialog({
        title: 'Select the root path of your project',
        properties: ['openDirectory'],
      })
      .then((result) => {
        if (!result.canceled && result.filePaths !== null && result.filePaths.length > 0) {
          this.props.onDirectoryChanged(result.filePaths[0]);
          this.setState({ validationErrorMessage: null });
        }
        return result;
      })
      .catch((err) => {
        this.setState({
          validationErrorMessage: `There was an error accessing the project root folder: ${err}`,
        });
      });
  };

  handleNameChanged = (e) => {
    this.props.onNameChanged(e.target.value);
  };

  render() {
    let validation = null;
    if (this.state.validationErrorMessage) {
      validation = <Error style={{ marginTop: '15px' }}>{this.state.validationErrorMessage}</Error>;
    }

    return (
      <div className={styles.container} data-tid="container">
        <fieldset>
          <legend>Project name:</legend>
          <input type="text" onChange={this.handleNameChanged} value={this.props.name} />
        </fieldset>
        <fieldset>
          <legend>Create project as subdirectory of:</legend>
          <input readOnly type="text" value={this.props.directory} />
          <Button
            className={styles.browse}
            onClick={this.handleBrowseDirectory}
            variant="contained"
          >
            Browse...
          </Button>
        </fieldset>
        <ConfigFileInfo />
        {validation}
      </div>
    );
  }
}

NewDirectory.propTypes = {
  name: PropTypes.string.isRequired,
  directory: PropTypes.string.isRequired,
  onDirectoryChanged: PropTypes.func.isRequired,
  onNameChanged: PropTypes.func.isRequired,
};

export default NewDirectory;
