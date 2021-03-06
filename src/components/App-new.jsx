import React from 'react'
import {audioFile2} from "../helpers/helper";
import OthersVideoFeed from './OthersVideoFeed'
import ClientVideoFeed from './ClientVideoFeed'
import ReactTooltip from 'react-tooltip'

import '../assets/css/app.css'
import '../assets/css/styles.css'
import '../assets/css/canvas.css'
import { Navbar, Nav, MenuItem, NavItem, DropdownButton } from 'react-bootstrap';

//TODO Clear styles

const app = {
    app: {display: 'flex', height: '100vh', padding: '83px 0px 0px 0px'},
    currentRemote: {height: '100%', width: '70%'},
    dash: {height: '100%', width: '30%'},
    client: {height: '300px', borderBottom: '2px solid yellow'},
    remote: {height: 'calc(100% - 300px)', overflowY: 'scroll'},
    navbar: {height: '100%', width: '100%'},
    name: {color: 'black', padding: '10px 0px 0px 0px'}
}

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            battery: 0,
            video_stats: {},
            audio_stats: {},
            current: null,
            mixing: false,
            hide: false
        }
        this.startMixing = this.startMixing.bind(this)
        this.pauseMixing = this.pauseMixing.bind(this)
        this.stopMixing = this.stopMixing.bind(this)
        this.resumeMixing = this.resumeMixing.bind(this)
        this.getNavigationBar = this.getNavigationBar.bind(this)
    }

    componentDidMount() {

        //Defines a client for RTC
        let client = window.agora

        // Quality Transparency
        client.on('stream-published', val => {
            setInterval(() => {
                client.getSystemStats(stats => {
                    this.setState({battery: stats.BatteryLevel})
                })
            }, 5000)


            setInterval(() => {
                client.getLocalVideoStats(stats => {
                    this.setState({video_stats: stats})
                })

                client.getLocalAudioStats(stats => {
                    this.setState({audio_stats: stats})
                })

            }, 1000)
        })

        // Triggers the "volume-indicator" callback event every two seconds.
        client.enableAudioVolumeIndicator()
        client.on("volume-indicator", function (evt) {
            evt.attr.forEach(function (volume, index) {
                console.log(`#${index} UID ${volume.uid} Level ${volume.level}`);
            });
        });
    }

    startMixing() {
        const options = {
            filePath: audioFile2,
            playTime: 0,
            replace: false
        }
        window.localStream.startAudioMixing(options, (err) => {
            if (err === null) {
                this.setState({mixing: true})
            }
        })
    }

    pauseMixing() {
        if(this.state.mixing === true){
            window.localStream.pauseAudioMixing()
            this.setState({mixing: false})
        }
}

    resumeMixing() {
        if(this.state.mixing === false){
            window.localStream.resumeAudioMixing()
            this.setState({mixing: true})
        }
    }

    stopMixing() {
        if(this.state.mixing === true){
            window.localStream.stopAudioMixing()
            this.setState({mixing: false})
        }
    }

componentWillUnmount() {
        window.localStream.close()
    }

    getNavigationBar () {
        var audio_key = Object.keys(this.state.audio_stats);
        var video_key = Object.keys(this.state.video_stats);
        return <div>
            <Navbar fixedTop>
            <Navbar.Header>
                <Navbar.Brand>
                    <p data-tip='Channel Name' style={app.name}>
                        {window.location.search.split('=')[1]}
                    </p>
                    
                    <ReactTooltip place="top" type="dark" effect="float"/>
                </Navbar.Brand>
                <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
                <Nav pullRight>
                    <NavItem>
                        <DropdownButton 
                            eventKey={4} 
                            onClick = 
                                {() => this.setState({hide: !this.state.hide})}
                            bsSize="xsmall"
                            title={'Stats'} 
                            noCaret
                            id="stream-dropdown"
                        >
                            {/* <Clearfix> */}
                            {/* <ul className="dropdown-menu open"> */}
                                <MenuItem header>System Battery</MenuItem>
                                <MenuItem>
                                    {this.state.battery ? 
                                        `Current Battery Level: ${this.state.battery}`
                                        : 'Hang on tight, digging it out!' }                                
                                </MenuItem>
                                <MenuItem divider />
                                <MenuItem header>Local Audio Stats</MenuItem>
                                <MenuItem>{`Energy level of the captured audio:  ${audio_key.length !== 0 ? this.state.audio_stats[audio_key[0]]['RecordingLevel'] : "Not Available"}`}</MenuItem>
                                <MenuItem>{`Bitrate of the sent audio, in Kbps:  ${audio_key.length !== 0 ? this.state.audio_stats[audio_key[0]]['SendBitrate'] : "Not Available"}`}</MenuItem>
                                <MenuItem>{`Whether the audio is muted or not:  ${audio_key.length !== 0 ? (this.state.audio_stats[audio_key[0]]['MuteState'] === "0" ? "Unmuted" : "Muted") : "Not Available"}`}</MenuItem>
                                <MenuItem>{`Energy level of the sent audio:  ${audio_key.length !== 0 ? this.state.audio_stats[audio_key[0]]['SendLevel'] : "Not Available"}`}</MenuItem>
                                <MenuItem divider />
                                <MenuItem header>Local Video Stats</MenuItem>
                                <MenuItem>{`Resolution height of the sent video, in pixels:  ${video_key.length !== 0 ? this.state.video_stats[video_key[0]]['SendResolutionHeight'] : "Not Available"}`}</MenuItem>
                                <MenuItem>{`Resolution width of the sent video, in pixels:  ${video_key.length !== 0 ? this.state.video_stats[video_key[0]]['SendResolutionWidth'] : "Not Available"}`}</MenuItem>
                                <MenuItem>{`Bitrate of the sent video, in Kbps:  ${video_key.length !== 0 ? this.state.video_stats[video_key[0]]['SendBitrate'] : "Not Available"}`}</MenuItem>
                                <MenuItem>{`Frame rate of the sent video, in fps:  ${video_key.length !== 0 ? this.state.video_stats[video_key[0]]['SendFrameRate'] : "Not Available"}`}</MenuItem>

                            {/* </ul> */}
                            {/* </Clearfix> */}
                        </DropdownButton>
                    </NavItem>

                    <NavItem>
                        <DropdownButton 
                            eventKey={3} 
                            onClick = 
                                {() => this.setState({hide: !this.state.hide})}
                            bsSize="xsmall"
                            title={'Audio Mixing Controls'} 
                            noCaret
                            id="music-dropdown"
                        >
                            <MenuItem eventKey={3.1} onClick={this.startMixing}>
                                Start
                            </MenuItem>
                            <MenuItem divider />
                            <MenuItem eventKey={3.2} onClick={this.resumeMixing}>
                                Resume
                            </MenuItem>
                            <MenuItem divider />
                            <MenuItem eventKey={3.3} onClick={this.pauseMixing}>
                                Pause
                            </MenuItem>
                            <MenuItem divider />
                            <MenuItem eventKey={3.3} onClick={this.stopMixing}>
                                Stop
                            </MenuItem>
                        </DropdownButton>
                    </NavItem>
                </Nav>
            </Navbar.Collapse>
            </Navbar>
        </div>
    }

    render() {
        return (
        
            <div>
                <div>
                
                {this.getNavigationBar()}
                </div>
                <div style={app.app}>
                    <div style={app.currentRemote}>
                        <div id={'current'}/>
                    </div>
                    <div style={app.dash}>
                        <div style={app.client}>
                            <ClientVideoFeed battery={this.state.battery}/>
                        </div>
                        <div style={app.remote}>
                            <OthersVideoFeed feeds={this.state.feeds}/>
                        </div>
                </div>
                </div>
            </div>

        )
    }
}

export default App
