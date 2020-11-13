/* eslint-disable no-lonely-if */
/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import { Tab } from '@material-ui/core';
import { TabPanel, TabContext, TabList } from '@material-ui/lab';
import { withStyles } from '@material-ui/core/styles/';
import IconButton from '@material-ui/core/IconButton';
import { Star, StarBorder } from '@material-ui/icons';
import PropTypes from 'prop-types';
import EditableLabel from '../EditableLabel/EditableLabel';
import Welcome from '../Welcome/Welcome';
import About from './About/About';
import Assets from './Assets/Assets';
import NewsFeed from '../NewsFeed/NewsFeed';
import { ActionType } from '../../constants/constants';
import AssetUtil from '../../utils/asset';
import styles from './Project.css';
import UserContext from '../User/User';

type Props = {};

// We typically do our styles in a separate CSS, but this has been the best way to
// override Material-UI specific styles, so we will do it in code.
const muiStyles = () => ({
  tabIndicator: {
    backgroundColor: 'white'
  },
  scrollButtons: {
    color: 'white'
  },
  tabRoot: {
    backgroundColor: '#3c629e',
    border: 'solid 1px #000',
    fontSize: '0.8rem'
  },
  tabSelected: {
    backgroundColor: '#6c92de',
    color: '#fff',
    fontSize: '0.9rem'
  },
  tabPanel: {
    padding: '10px'
  }
});

class Project extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = { selectedTab: 'about' };
  }

  changeHandler = (event, id) => {
    this.setState({ selectedTab: id });
  };

  /**
   * General handler to either insert a new note for an asset or update an existing note for
   * an asset.  It figures out the appropriate action to take depending on if the note parameter
   * is provided or not.
   * @param {object} asset The asset for which the note should be added/updated
   * @param {string} text The note text
   * @param {object} note Optional parameter if there is an existing note being updated.  If falsey, we assume this is a new note.
   */
  assetUpsertNoteHandler = (asset, text, note) => {
    const project = { ...this.props.project };
    const assetsCopy = { ...project.assets };

    // When searching for the existing asset, remember that assets is an object and the top-level item is
    // in the root of the object.  Start there before looking at the children.
    const action = { type: '', description: '', details: null };
    const existingAsset = AssetUtil.findDescendantAssetByUri(assetsCopy, asset.uri);
    if (!existingAsset) {
      console.log('No existing asset found in project data');
      // No existing asset, so we are going to register a new entry
      const newAsset = { ...asset };
      if (!newAsset.notes) {
        newAsset.notes = [];
      }
      newAsset.notes.push(note);
      action.type = ActionType.NOTE_ADDED;
      action.description = `Added note to asset ${asset.uri}`;
      action.details = note;
      assetsCopy.push(newAsset);
    } else {
      const user = this.context;
      // We already have the asset, so manage updating the note

      // Because we are updating a note, if there is no notes collection we obviously don't
      // have anything to update.  Instead we'll just treat it like adding a new note.
      if (!existingAsset.notes) {
        console.warn('Project - creating note collection because no notes available when updating');
        existingAsset.notes = [];
        const newNote = note ? { ...note, text } : AssetUtil.createNote(user, text);
        existingAsset.notes.push(newNote);
        action.type = ActionType.NOTE_ADDED;
        action.description = `${user} added note to asset ${asset.uri}`;
        action.details = newNote;
      } else {
        // Try to find the existing note, if an existing note was provided.
        const existingNote = note ? existingAsset.notes.find(x => x.id === note.id) : null;

        if (!existingNote) {
          console.log('Adding a new note');
          const newNote = AssetUtil.createNote(user, text);
          existingAsset.notes.push(newNote);
          action.type = ActionType.NOTE_ADDED;
          action.description = `${user} added note to asset ${asset.uri}`;
          action.details = newNote;
        } else if (existingNote.content === note) {
          console.log('Note is unchanged - no update');
        } else {
          console.log('Updating existing note');
          const originalNote = { ...existingNote };
          existingNote.content = text;
          existingNote.updated = AssetUtil.getNoteDate();

          action.type = ActionType.NOTE_UPDATED;
          action.description = `${user} updated note for asset ${asset.uri}`;
          action.details = { old: originalNote, new: note };
        }
      }
    }
    project.assets = assetsCopy;
    if (this.props.onUpdated) {
      this.props.onUpdated(project, action.type, action.description, action.details);
    }
  };

  assetDeleteNoteHandler = (asset, note) => {
    const project = { ...this.props.project };
    const assetsCopy = { ...project.assets };
    // When searching for the existing asset, remember that assets is an object and the top-level item is
    // in the root of the object.  Start there before looking at the children.
    const existingAsset = AssetUtil.findDescendantAssetByUri(assetsCopy, asset.uri);
    let actionDescription = '';
    if (!existingAsset) {
      console.warn('Could not find the asset to delete its note');
    } else {
      // Try to find the existing note, if an existing note was provided.
      const index = existingAsset.notes.findIndex(x => x.id === note.id);
      if (index === -1) {
        console.warn(`Could not find the note with ID ${note.id} for this asset to delete it`);
      } else {
        const user = this.context;
        actionDescription = `${user} deleted note from asset ${asset.uri}`;
        existingAsset.notes.splice(index, 1);
      }
    }

    project.assets = assetsCopy;
    if (this.props.onUpdated) {
      this.props.onUpdated(project, ActionType.NOTE_DELETED, actionDescription, note);
    }
  };

  render() {
    const tabStyle = { root: this.props.classes.tabRoot, selected: this.props.classes.tabSelected };
    const tabPanelStyle = { root: this.props.classes.tabPanel };

    let content = <Welcome />;
    if (this.props.project) {
      const about = this.props.project ? <About project={this.props.project} /> : null;
      const assets = this.props.project ? (
        <Assets
          project={this.props.project}
          onAddedAssetNote={this.assetUpsertNoteHandler}
          onUpdatedAssetNote={this.assetUpsertNoteHandler}
          onDeletedAssetNote={this.assetDeleteNoteHandler}
        />
      ) : null;
      const name = this.props.project ? (
        <EditableLabel
          text={this.props.project.name}
          labelFontWeight="bold"
          inputFontWeight="bold"
          inputClassName={styles.editableLabel}
          inputWidth="100%"
        />
      ) : null;

      const newsFeed =
        this.props.project && this.props.logs ? (
          <NewsFeed
            project={this.props.project}
            error={this.props.logs.errorMessage}
            feed={this.props.logs.logs}
          />
        ) : null;

      content = (
        <TabContext value={this.state.selectedTab}>
          <div className={styles.header}>
            <div className={styles.titleContainer}>
              <IconButton color="inherit">
                {this.props.project && this.props.project.favorite ? <Star /> : <StarBorder />}
              </IconButton>
              <div className={styles.title}>{name}</div>
            </div>
            <TabList
              aria-label="Project details"
              variant="scrollable"
              onChange={this.changeHandler}
              classes={{
                indicator: this.props.classes.tabIndicator,
                scrollButtons: this.props.classes.scrollButtons
              }}
            >
              <Tab label="About" value="about" classes={tabStyle} />
              <Tab label="Assets" value="assets" classes={tabStyle} />
              <Tab label="Workflows" value="workflows" classes={tabStyle} />
              <Tab label="People" value="people" classes={tabStyle} />
              <Tab label="References" value="references" classes={tabStyle} />
              <Tab label="News Feed" value="newsFeed" classes={tabStyle} />
            </TabList>
          </div>
          <TabPanel value="about" classes={tabPanelStyle}>
            {about}
          </TabPanel>
          <TabPanel value="assets" classes={tabPanelStyle}>
            {assets}
          </TabPanel>
          <TabPanel value="workflows" classes={tabPanelStyle}>
            TBD
          </TabPanel>
          <TabPanel value="people" classes={tabPanelStyle}>
            TBD
          </TabPanel>
          <TabPanel value="references" classes={tabPanelStyle}>
            TBD
          </TabPanel>
          <TabPanel value="newsFeed" classes={tabPanelStyle}>
            {newsFeed}
          </TabPanel>
        </TabContext>
      );
    }
    return (
      <div className={styles.container} data-tid="container">
        {content}
      </div>
    );
  }
}

Project.propTypes = {
  project: PropTypes.object,
  classes: PropTypes.object,
  onUpdated: PropTypes.func,
  logs: PropTypes.object
};

Project.defaultProps = {
  project: null,
  classes: null,
  onUpdated: null,
  logs: null
};

Project.contextType = UserContext;

export default withStyles(muiStyles)(Project);
