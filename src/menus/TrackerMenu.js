import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TiVideo } from 'react-icons/ti';
import Map from 'ol/Map';
import LayerService from 'react-spatial/LayerService';
import TrackerLayer from 'react-public-transport/components/Tracker/TrackerLayer';
import MenuItem from '../components/Menu/MenuItem';
import './TrackerMenu.scss';

const propTypes = {
  layerService: PropTypes.instanceOf(LayerService).isRequired,
  map: PropTypes.instanceOf(Map).isRequired,
  open: PropTypes.bool.isRequired ,
};

class TrackerMenu extends Component {
  static getTimeString(time) {
    return [
      `0${time.getHours()}`.slice(-2),
      `0${time.getMinutes()}`.slice(-2),
    ].join(':');
  }

  constructor(props) {
    super(props);
    const { layerService } = this.props;

    this.trackerLayer = layerService
      .getLayersAsFlatArray()
      .find(l => l instanceof TrackerLayer);

    this.state = {
      visible: this.trackerLayer && this.trackerLayer.getVisible(),
      trajectory: null,
    };

    if (this.trackerLayer) {
      this.trackerLayer.olLayer.on('change:visible', () =>
        this.setState({ visible: this.trackerLayer.getVisible() }),
      );

      this.trackerLayer.onClick(trajectories => {
        if (trajectories.length) {
          const trajectory = [];
          const id = trajectories[0].get('id');

          this.trackerLayer.fetchTrajectory(id).then(traj => {
            for (let i = 0; i < traj.p.length; i += 1) {
              for (let j = 0; j < traj.p[i].length; j += 1) {
                const stop = traj.p[i][j];
                if (stop.n) {
                  trajectory.push({
                    name: stop.n,
                    arrival: stop.a ? stop.a * 1000 : null,
                    departure: stop.d ? stop.d * 1000 : null,
                  });
                }
              }
            }

            this.setState({ trajectory });
          });
        }
      });
    }
  }

  render() {
    const { visible, trajectory } = this.state;
    const { closed, map } = this.props;
    let trajectoryElem = null;

    if (!visible) {
      return null;
    }

    if (trajectory) {
      trajectoryElem = (
        <div className="wkp-trajectory">
          {trajectory.map(t => (
            <div key={t.name} className="wkp-trajectory-stop">
              <div className="wkp-trajectory-stop-time">
                {TrackerMenu.getTimeString(new Date(t.arrival))}
                <div className="wkp-trajectory-stop-icon" />
              </div>
              <div className="wkp-trajectory-stop-name">{t.name}</div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <MenuItem
        className="wkp-tracker-menu"
        title="Zugtracker"
        icon=<TiVideo />
        map={map}
        closed={closed}
      >
        {trajectoryElem}
      </MenuItem>
    );
  }
}

TrackerMenu.propTypes = propTypes;
export default TrackerMenu;