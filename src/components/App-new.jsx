import React from 'react'
import {audioFile} from "../helpers/helper";
import OthersVideoFeed from './OthersVideoFeed'
import ClientVideoFeed from './ClientVideoFeed'
import ReactTooltip from 'react-tooltip'

// Images for the battery
import zero from '../assets/images/0.png';
import tfive from '../assets/images/25.png';
import fifty from '../assets/images/50.png';
import sfive from '../assets/images/75.png';
import cent from '../assets/images/100.png';

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
    navbar: {height: '100%', width: '100%'}
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
        this.checkBattery = this.checkBattery.bind(this);
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
                    console.log("Battery level: " + stats.BatteryLevel)
                    this.setState({battery: stats.BatteryLevel})
                })
            }, 5000)


            setInterval(() => {
                client.getLocalVideoStats(stats => {
                    this.setState({video_stats: stats})
                    console.log('Local Video Stats:\n', stats, '\nEnding the video stats')
                })

                client.getLocalAudioStats(stats => {
                    this.setState({audio_stats: stats})
                    console.log('Local Audio Stats:\n', stats, '\nEnding the audio stats')
                })

            }, 1000)
        })

        // Triggers the "volume-indicator" callback event every two seconds.
        client.enableAudioVolumeIndicator()
        client.on("volume-indicator", function (evt) {
            console.log('enters the volume indicator', evt.attr)
            evt.attr.forEach(function (volume, index) {
                console.log(`#${index} UID ${volume.uid} Level ${volume.level}`);
            });
        });
    }

    startMixing() {
        const options = {
            filePath: audioFile,
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
        window.localStream.pauseAudioMixing()
    }

    resumeMixing() {
        window.localStream.resumeAudioMixing()
    }

    stopMixing() {
        window.localStream.stopAudioMixing()
    }

    componentWillUnmount() {
        console.log('UNOINOSIDNFSIDF')
        window.localStream.close()
    }

    // getCurrentId(video, streamIds) {
    //     window.stream.stop()
    //     console.log(streamIds)
    //     if(video) {
    //         video.style.height = '100vh'
    //         video.style.width = '100%'
    //         video.removeEventListener('click', () => {
    //         })
    //         document.getElementById('current').appendChild(video)
    //     }
    //     window.stream.play(video.id,{fit:'content'})
    //
    // }

    checkBattery(value) {
        const batt = value
        var status;
        if (batt.battery < 10) {
            status = zero
        } else if (batt.battery < 25) {
            status = tfive
        } else if (batt.battery < 50) {
            status = fifty
        } else if (batt.battery < 75) {
            status = sfive
        } else status = cent
        return status 
    }

    getNavigationBar () {
        var audio_key = Object.keys(this.state.audio_stats);
        var video_key = Object.keys(this.state.video_stats);
        console.log("Audio key : ", audio_key, " Video Key: ", video_key);
        return <div>
            <Navbar fixedTop>
            <Navbar.Header>
                <Navbar.Brand>
                    <p data-tip={this.state.battery ? 
                        `Current Battery Level: ${this.state.battery}`
                        : 'Hang on tight, digging it out!' } href='#' 
                    >
                        <img src = 
                        {this.checkBattery(this.state)}
                        alt="Battery Level Indicator"
                        />
                    </p>
                    
                    <ReactTooltip place="top" type="dark" effect="float"/>
                </Navbar.Brand>
                <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
                <Nav pullRight>
                    {/* TODO Channel Name */}
                    {/* <NavItem eventKey={1}>
                        <p data-tip="Channel Name">
                            {window.location.search.split('=')[1]}
                        
                            <ReactTooltip place="top" type="dark" effect="float"/>
                        </p>
                    </NavItem> */}
                    <NavItem>
                        <DropdownButton 
                            eventKey={4} 
                            onClick = 
                                {() => this.setState({hide: !this.state.hide})}
                            bsSize="xsmall"
                            title={'Stream Quality'} 
                            noCaret
                            id="stream-dropdown"
                        >
                            {/* <Clearfix> */}
                            {/* <ul className="dropdown-menu open"> */}
                                <MenuItem header>Local Audio Stats</MenuItem>
                                <MenuItem>{`Encoding type of the sent audio: ${audio_key.length !== 0 ? this.state.audio_stats[audio_key[0]]['CodecType'] : "Not Available"}`}</MenuItem>
                                <MenuItem>{`Energy level of the captured audio:  ${audio_key.length !== 0 ? this.state.audio_stats[audio_key[0]]['RecordingLevel'] : "Not Available"}`}</MenuItem>
                                <MenuItem>{`Bitrate of the sent audio, in Kbps:  ${audio_key.length !== 0 ? this.state.audio_stats[audio_key[0]]['SendBitrate'] : "Not Available"}`}</MenuItem>
                                <MenuItem>{`Whether the audio is muted or not:  ${audio_key.length !== 0 ? (this.state.audio_stats[audio_key[0]]['MuteState'] === 0 ? "Unmuted" : "Muted") : "Not Available"}`}</MenuItem>
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
                                Play
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
        console.log(JSON.stringify(this.state.audio_stats))
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
